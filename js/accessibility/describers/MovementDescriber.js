// Copyright 2018-2020, University of Colorado Boulder

/**
 * A generic accessibility type that will alert positional alerts based on a positionProperty and bounds (see
 * BorderAlertsDescriber) encapsulating the draggable area.
 *
 * General usage involves calling this endDrag() function from all dragListeners that you want this functionality to describe
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AlertableDef = require( 'UTTERANCE_QUEUE/AlertableDef' );
  const BorderAlertsDescriber = require( 'SCENERY_PHET/accessibility/describers/BorderAlertsDescriber' );
  const DirectionEnum = require( 'SCENERY_PHET/accessibility/describers/DirectionEnum' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Range = require( 'DOT/Range' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );
  const Utterance = require( 'UTTERANCE_QUEUE/Utterance' );
  const Vector2 = require( 'DOT/Vector2' );

  // a11y strings
  const downString = SceneryPhetA11yStrings.down.value;
  const leftString = SceneryPhetA11yStrings.left.value;
  const rightString = SceneryPhetA11yStrings.right.value;
  const upString = SceneryPhetA11yStrings.up.value;
  const upAndToTheLeftString = SceneryPhetA11yStrings.upAndToTheLeft.value;
  const upAndToTheRightString = SceneryPhetA11yStrings.upAndToTheRight.value;
  const downAndToTheLeftString = SceneryPhetA11yStrings.downAndToTheLeft.value;
  const downAndToTheRightString = SceneryPhetA11yStrings.downAndToTheRight.value;

  // constants
  // in radians - threshold for diagonal movement is +/- 15 degrees from diagonals
  const DIAGONAL_MOVEMENT_THRESHOLD = 15 * Math.PI / 180;

  // mapping from alerting direction to the radian range that fills that space in the unit circle.
  //
  // 'UP' is in the bottom two quadrants and 'DOWN' is in the top two quadrants because y increases down for scenery.
  //
  // The diagonal directions take up the middle third of each quadrant, such that each "outside" third is in the range
  // for a relative (primary) direction. Therefore each diagonal direction is 1/9 of the Unit circle, and each
  // primary direction is 2/9 of the unit circle.
  const DIRECTION_MAP = {
    UP: new Range( -3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, -Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD ),
    DOWN: new Range( Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, 3 * Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD ),
    RIGHT: new Range( -Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD ),

    // atan2 wraps around PI, so we will use absolute value in checks
    LEFT: new Range( 3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, Math.PI ),

    UP_LEFT: new Range( -3 * Math.PI - DIAGONAL_MOVEMENT_THRESHOLD, -3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD ),
    DOWN_LEFT: new Range( 3 * Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, 3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD ),
    UP_RIGHT: new Range( -Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, -Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD ),
    DOWN_RIGHT: new Range( Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD )
  };
  const DIRECTION_MAP_KEYS = Object.keys( DIRECTION_MAP );

  if ( assert ) {
    DIRECTION_MAP_KEYS.forEach( direction => {
      assert( DirectionEnum.keys.indexOf( direction ) >= 0, `unexpected direction: ${direction}. Keys should be the same as those in DirectionEnum` );
    } );
  }

  // the set of directional alerts including cardinal and intercardinal directions
  const DEFAULT_MOVEMENT_DESCRIPTIONS = {
    LEFT: leftString,
    RIGHT: rightString,
    UP: upString,
    DOWN: downString,
    UP_LEFT: upAndToTheLeftString,
    UP_RIGHT: upAndToTheRightString,
    DOWN_LEFT: downAndToTheLeftString,
    DOWN_RIGHT: downAndToTheRightString
  };

  class MovementDescriber {

    /**
     * @param {Property.<Vector2>} positionProperty - Property that drives movement, in model coordinate frame
     * @param {Object} [options]
     */
    constructor( positionProperty, options ) {

      options = merge( {

        // see BorderAlertsDescriber
        borderAlertsOptions: null,

        // {Object.<DIRECTION, AlertableDef> see DirectionEnum for allowed keys. Any missing keys will not be alerted.
        // Use `{}` to omit movementAlerts.
        movementAlerts: DEFAULT_MOVEMENT_DESCRIPTIONS,

        // {ModelViewTransform2} - if provided, this will transform between the model and view coordinate frames, so
        // that movement in the view is described
        modelViewTransform: ModelViewTransform2.createIdentity(),

        // if false then diagonal alerts will be converted to two primary direction alerts that are alerted back to back
        // i.e. UP_LEFT becomes "UP" and "LEFT"
        alertDiagonal: false
      }, options );

      assert && assert( options.movementAlerts instanceof Object );
      assert && assert( !Array.isArray( options.movementAlerts ) ); // should not be an Array

      // @private
      this.movementAlertKeys = Object.keys( options.movementAlerts );
      if ( assert ) {

        for ( let i = 0; i < this.movementAlertKeys.length; i++ ) {
          const key = this.movementAlertKeys[ i ];
          assert( DirectionEnum.keys.indexOf( key ) >= 0, `unexpected key: ${key}. Keys should be the same as those in DirectionEnum` );
          assert( AlertableDef.isAlertableDef( options.movementAlerts[ key ] ) );
        }
      }

      // @private
      this.movementAlerts = options.movementAlerts;
      this.alertDiagonal = options.alertDiagonal;
      this.modelViewTransform = options.modelViewTransform;

      // @private
      // This sub-describer handles the logic for alerting when an item is on the edge of the movement space
      this.borderAlertsDescriber = new BorderAlertsDescriber( options.borderAlertsOptions );

      // @private {Utterance} - single utterance to describe direction changes so that when this
      // happens frequently only the last change is announced
      this.directionChangeUtterance = new Utterance();

      // @private
      this.initialFirstPosition = positionProperty.get();

      // @protected
      this.positionProperty = positionProperty;
      this.lastAlertedPosition = this.initialFirstPosition; // initial value of the positionProperty
    }

    /**
     * Simple alert for the Describer
     * @param {AlertableDef} alertable - anything that can be passed to UtteranceQueue
     */
    alert( alertable ) {
      phet.joist.sim.utteranceQueue.addToBack( alertable );
      this.lastAlertedPosition = this.positionProperty.get();
    }

    /**
     * Can be called with multiple directions, or just a single direction
     * @protected
     * @param {Array.<DirectionEnum>|DirectionEnum} directions
     */
    alertDirections( directions ) {
      if ( DirectionEnum.includes( directions ) ) {
        directions = [ directions ];
      }

      // support if an instance doesn't want to alert in all directions
      directions.forEach( direction => {
        this.directionChangeUtterance.alert = this.movementAlerts[ direction ];
        this.alert( this.directionChangeUtterance );
      } );
    }

    /**
     * Alert a movement direction. The direction from this.lastAlertedPosition relative to the current value of the positionProperty
     * Call this from a listener or when the positionProperty has changed enough.
     * Can be overridden. Easy to implement method with the following schema:
     * (1) get the current value of the position property, and make sure it has changed enough from the lastAlertedPosition
     * (2) get the directions from the difference,
     * (3) alert those directions by calling this.alertDirections or this.alert,
     * see friction/view/describers/BookMovementDescriber.
     *
     * NOTE: don't call UtteranceQueue from the subtype!!!
     * NOTE: PhET a11y convention suggests that this should be called on drag end.
     *
     * @public
     */
    alertDirectionalMovement() {

      const newPosition = this.positionProperty.get();
      if ( !newPosition.equals( this.lastAlertedPosition ) ) {

        const directions = this.getDirections( newPosition, this.lastAlertedPosition );

        // make sure that these alerts exist
        if ( assert ) {
          directions.map( direction => { assert( this.movementAlerts[ direction ] && typeof this.movementAlerts[ direction ] === 'string' ); } );
        }
        this.alertDirections( directions );
      }
    }

    /**
     * Get the direction of movement that would take you from point A to point B, returning one of DirectionEnum.
     * These directions are described as they appear visually, with positive y going up.
     *
     * Uses Math.atan2, so the angle is mapped from 0 to +/- Math.PI.
     *
     * @param  {Vector2} newPoint - in the model coordinate frame
     * @param  {Vector2} oldPoint - in the model coordinate frame
     * @returns {Array.<DirectionEnum>} - contains one or two of the values in DirectionEnum, depending on whether or no you get
     *                            diagonal directions or their composite. See options.alertDiagonal for more info
     * @protected
     */
    getDirections( newPoint, oldPoint ) {

      const direction = MovementDescriber.getDirectionEnumerable( newPoint, oldPoint, this.modelViewTransform );

      // This includes complex directions like "UP_LEFT"
      if ( this.alertDiagonal ) {
        return [ direction ];
      }
      else {
        return DirectionEnum.directionToRelativeDirections( direction );
      }
    }

    /**
     * Get one of DirectionEnum from a newPoint and an oldPoint that would describe the direction of movement
     * from the old point to the new point. These directions are described as they would appear visually, with
     * +y going up.
     * @private
     *
     * @param {Vector2} newPoint - in model coordinate frame
     * @param {Vector2} oldPoint - in model coordinate frame
     * @param {ModelViewTransform2} modelViewTransform
     * @returns {DirectionEnum}
     */
    static getDirectionEnumerable( newPoint, oldPoint, modelViewTransform ) {
      let direction;

      // to view coordinates to motion in the screen
      const newViewPoint = modelViewTransform.modelToViewPosition( newPoint );
      const oldViewPoint = modelViewTransform.modelToViewPosition( oldPoint );

      const dx = newViewPoint.x - oldViewPoint.x;
      const dy = newViewPoint.y - oldViewPoint.y;
      const angle = Math.atan2( dy, dx );

      // atan2 wraps around Math.PI, so special check for moving left from absolute value
      if ( DIRECTION_MAP.LEFT.contains( Math.abs( angle ) ) ) {
        direction = DirectionEnum.LEFT;
      }

      // otherwise, angle will be in one of the ranges in DIRECTION_MAP
      for ( let i = 0; i < DIRECTION_MAP_KEYS.length; i++ ) {
        const entry = DIRECTION_MAP[ DIRECTION_MAP_KEYS[ i ] ];
        if ( entry.contains( angle ) ) {
          direction = DirectionEnum[ DIRECTION_MAP_KEYS[ i ] ];
          break;
        }
      }

      return direction;
    }

    /**
     * Get a description of direction from the provided angle. This will describe the motion as it appears
     * on screen. The angle should go from 0 to 2PI. Angles in the top two quadrants are described as going 'up'.
     * Angles in bottom two quadrants are described as going 'down'. Angles in the right two quadrants are described
     * as going "right", and angles in the left two quadrants are described as going to the left.
     *
     * For now, this will always include diagonal alerts. In the future we can exclude the primary intercardinal
     * directions.
     * @public
     *
     * @param {number} angle - an angle of directional movement in the model coordinate frame
     * @param {Object} [options]
     * @returns {string}
     */
    static getDirectionDescriptionFromAngle( angle, options ) {

      options = merge( {

        // see constructor options for description
        modelViewTransform: ModelViewTransform2.createIdentity()
      }, options );

      // start and end positions to determine angle in view coordinate frame
      const modelStartPoint = new Vector2( 0, 0 );
      const modelEndPoint = new Vector2( Math.cos( angle ), Math.sin( angle ) );

      const direction = MovementDescriber.getDirectionEnumerable( modelEndPoint, modelStartPoint, options.modelViewTransform );
      return DEFAULT_MOVEMENT_DESCRIPTIONS[ direction ];
    }

    /**
     * @public
     * @param {window.Event} [domEvent]
     */
    endDrag( domEvent ) {

      // better to have the movement alerts, then the alert about the border
      this.alertDirectionalMovement();
      this.borderAlertsDescriber.endDrag( this.positionProperty.get(), domEvent );
    }

    /**
     * @public
     */
    reset() {
      this.lastAlertedPosition = this.initialFirstPosition;

      // if any alerts are of type Utterance, reset them.
      this.movementAlertKeys.forEach( direction => {
        const alert = this.movementAlerts[ direction ];
        alert && alert.reset && alert.reset();
      } );

      this.borderAlertsDescriber.reset();
    }

    /**
     * Get the default movement descriptions
     * @returns {Object.<DirectionEnum, string>}} - not an actual DirectionEnum, but the toString() of it (as a key).
     * @public
     */
    static getDefaultMovementDescriptions() {
      return merge( {}, DEFAULT_MOVEMENT_DESCRIPTIONS ); // clone
    }
  }

  return sceneryPhet.register( 'MovementDescriber', MovementDescriber );
} );