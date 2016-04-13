// Copyright 2014-2015, University of Colorado Boulder

/**
 * A scenery node that is used to represent a draggable Measuring Tape.
 * It contains a tip and a base that can be dragged separately,
 * with a text indicating the measurement.
 * The motion of the measuring tape can be confined by drag bounds.
 * The position of the measuring tape should be set via the basePosition
 * and tipPosition rather than the scenery coordinates
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (ActualConcepts)
 * @author Aaron Davis (PhET)
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var TandemDragHandler = require( 'TANDEM/scenery/input/TandemDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  // images
  var measuringTapeImage = require( 'image!SCENERY_PHET/measuringTape.png' );

  /**
   * Constructor for the measuring tape. WARNING: although the MeasuringTape will accept Scenery options such as
   * x, y, left, etc., you should not use these to set the position of the tape. Use basePositionProperty and
   * tipPositionProperty instead. However, because there are some Scenery options that might be useful, options
   * are still propogated to the supertype.
   *
   * @param {Property.<Object>} unitsProperty - it has two fields, (1) name <string> and (2) multiplier <number>,
   *                                            eg. {name: 'cm', multiplier: 100},
   * @param {Property.<boolean>} isVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function MeasuringTape( unitsProperty, isVisibleProperty, options ) {
    var measuringTape = this;

    Node.call( this );
    options = _.extend( {
      // base Position in model coordinate reference frame (rightBottom position of the measuring tape image)
      basePositionProperty: new Property( new Vector2( 0, 0 ) ),

      // tip Position in model coordinate reference frame (center position of the tip)
      tipPositionProperty: new Property( new Vector2( 1, 0 ) ),

      // bounds for the measuring tape (in model coordinate reference frame), default value is everything, effectively no bounds
      dragBounds: Bounds2.EVERYTHING,
      textPosition: new Vector2( 0, 30 ), // position of the text relative to center of the base image in view units
      modelViewTransform: ModelViewTransform2.createIdentity(),
      significantFigures: 1, // number of significant figures in the length measurement
      textColor: 'white', // color of the length measurement and unit
      textFont: new PhetFont( { size: 16, weight: 'bold' } ), // font for the measurement text
      baseScale: 0.8, // control the size of the measuringTape Image (the base)
      lineColor: 'gray', // color of the tapeline itself
      tapeLineWidth: 2, // linewidth of the tape line
      tipCircleColor: 'rgba(0,0,0,0.1)', // color of the circle at the tip
      tipCircleRadius: 10, // radius of the circle on the tip
      crosshairColor: 'rgb(224, 95, 32)', // orange, color of the two crosshairs
      crosshairSize: 5, // size of the crosshairs in scenery coordinates ( measured from center)
      crosshairLineWidth: 2, // linewidth of the crosshairs
      isBaseCrosshairRotating: true, // do crosshairs rotate around their own axis to line up with the tapeline
      isTipCrosshairRotating: true, // do crosshairs rotate around their own axis to line up with the tapeline
      isTipDragBounded: false, // is the tip subject to dragBounds
      tandem: null
    }, options );

    // @private - likely to be undefined if not being called from an instrumented sim.
    this.tandem = options.tandem;

    assert && assert( Math.abs( options.modelViewTransform.modelToViewDeltaX( 1 ) ) ===
                      Math.abs( options.modelViewTransform.modelToViewDeltaY( 1 ) ), 'The y and x scale factor are not identical' );

    this.significantFigures = options.significantFigures; // @private
    this.unitsProperty = unitsProperty; // @private
    this.isVisibleProperty = isVisibleProperty; // @private
    this._dragBounds = options.dragBounds; // @private
    this._modelViewTransform = options.modelViewTransform; // @private
    this.isTipDragBounded = options.isTipDragBounded; //@private
    this.basePositionProperty = options.basePositionProperty;
    this.tipPositionProperty = options.tipPositionProperty;

    this._isTipUserControlledProperty = new Property( false );// @private
    this._isBaseUserControlledProperty = new Property( false ); // @private

    this.tipToBaseDistance = (this.basePositionProperty.value).distance( this.tipPositionProperty.value ); // @private

    var crosshairShape = new Shape().
      moveTo( -options.crosshairSize, 0 ).
      moveTo( -options.crosshairSize, 0 ).
      lineTo( options.crosshairSize, 0 ).
      moveTo( 0, -options.crosshairSize ).
      lineTo( 0, options.crosshairSize );

    var baseCrosshair = new Path( crosshairShape, {
      stroke: options.crosshairColor,
      lineWidth: options.crosshairLineWidth
    } );

    var tipCrosshair = new Path( crosshairShape, {
      stroke: options.crosshairColor,
      lineWidth: options.crosshairLineWidth
    } );

    var tipCircle = new Circle( options.tipCircleRadius, { fill: options.tipCircleColor } );

    this.baseImage = new Image( measuringTapeImage, {
      scale: options.baseScale,
      cursor: 'pointer'
    } );

    // create tapeline (running from one crosshair to the other)
    var tapeLine = new Line( this.basePositionProperty.value, this.tipPositionProperty.value, {
      stroke: options.lineColor,
      lineWidth: options.tapeLineWidth
    } );

    // add tipCrosshair and tipCircle to the tip
    var tip = new Node( { children: [ tipCircle, tipCrosshair ], cursor: 'pointer' } );

    // create text
    // @public
    this.labelText = new Text( measuringTape.getText(), {
      font: options.textFont,
      fill: options.textColor
    } );

    // expand the area for touch
    tip.touchArea = tip.localBounds.dilated( 15 );
    this.baseImage.touchArea = this.baseImage.localBounds.dilated( 20 );
    this.baseImage.mouseArea = this.baseImage.localBounds.dilated( 10 );

    this.addChild( tapeLine ); // tapeline going from one crosshair to the other
    this.addChild( baseCrosshair ); // crosshair near the base, (set at basePosition)
    this.addChild( this.baseImage ); // base of the measuring tape
    this.addChild( this.labelText ); // text
    this.addChild( tip ); // crosshair and circle at the tip (set at tipPosition)

    var baseStartOffset;

    // @private
    this.baseDragHandler = new TandemDragHandler( {
      tandem: this.tandem ? this.tandem.createTandem( 'baseDragHandler' ) : null,

      allowTouchSnag: true,

      start: function( event, trail ) {
        measuringTape._isBaseUserControlledProperty.set( true );
        var location = measuringTape._modelViewTransform.modelToViewPosition( options.basePositionProperty.value );
        baseStartOffset = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( location );
      },

      drag: function( event ) {
        var parentPoint = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( baseStartOffset );
        var unconstrainedBaseLocation = measuringTape._modelViewTransform.viewToModelPosition( parentPoint );
        var constrainedBaseLocation = measuringTape._dragBounds.closestPointTo( unconstrainedBaseLocation );

        // the basePosition value has not been updated yet, hence it is the old value of the basePosition;
        var translationDelta = constrainedBaseLocation.minus( options.basePositionProperty.value ); // in model reference frame

        // translation of the basePosition (subject to the constraining drag bounds)
        options.basePositionProperty.set( constrainedBaseLocation );

        // translate the position of the tip if it is not being dragged
        // when the user is not holding onto the tip, dragging the body will also drag the tip
        if ( !measuringTape._isTipUserControlled ) {
          var unconstrainedTipLocation = translationDelta.add( measuringTape.tipPositionProperty.value );
          if ( options.isTipDragBounded ) {
            var constrainedTipLocation = measuringTape._dragBounds.closestPointTo( unconstrainedTipLocation );
            // translation of the tipPosition (subject to the constraining drag bounds)
            measuringTape.tipPositionProperty.set( constrainedTipLocation );
          }
          else {
            measuringTape.tipPositionProperty.set( unconstrainedTipLocation );
          }
        }
      },

      end: function( event, trail ) {
        measuringTape._isBaseUserControlledProperty.set( false );
      }
    } );

    this.baseImage.addInputListener( this.baseDragHandler );

    var tipStartOffset;

    // init drag and drop for tip
    tip.addInputListener( new TandemDragHandler( {
      tandem: this.tandem ? this.tandem.createTandem( 'tipDragHandler' ) : null,

      allowTouchSnag: true,

      start: function( event, trail ) {
        measuringTape._isTipUserControlledProperty.set( true );
        var location = measuringTape._modelViewTransform.modelToViewPosition( measuringTape.tipPositionProperty.value );
        tipStartOffset = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( location );
      },

      drag: function( event ) {
        var parentPoint = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( tipStartOffset );
        var unconstrainedTipLocation = measuringTape._modelViewTransform.viewToModelPosition( parentPoint );

        if ( options.isTipDragBounded ) {
          var constrainedTipLocation = measuringTape._dragBounds.closestPointTo( unconstrainedTipLocation );
          // translation of the tipPosition (subject to the constraining drag bounds)
          measuringTape.tipPositionProperty.set( constrainedTipLocation );
        }
        else {
          measuringTape.tipPositionProperty.set( unconstrainedTipLocation );
        }
      },

      end: function( event, trail ) {
        measuringTape._isTipUserControlledProperty.set( false );
      }
    } ) );

    /**
     * Update the scenery nodes of the measuring tape such as crosshair, tip, labelText, tapeLine, baseImage
     * based on the position of the base and tip of the measuringTape
     * @param {Vector2} basePosition
     * @param {Vector2} tipPosition
     * @private
     */
    this.updatePosition = function( basePosition, tipPosition ) {
      var viewTipPosition = measuringTape._modelViewTransform.modelToViewPosition( tipPosition );
      var viewBasePosition = measuringTape._modelViewTransform.modelToViewPosition( basePosition );

      // calculate the orientation and change of orientation of the Measuring tape
      var oldAngle = measuringTape.baseImage.getRotation();
      var angle = Math.atan2( viewTipPosition.y - viewBasePosition.y, viewTipPosition.x - viewBasePosition.x );
      var deltaAngle = angle - oldAngle;

      // set position of the tip and the base crosshair
      baseCrosshair.center = viewBasePosition;
      tip.center = viewTipPosition;

      // in order to avoid all kind of geometrical issues with position,
      // let's reset the baseImage upright and then set its position and rotation
      measuringTape.baseImage.setRotation( 0 );
      measuringTape.baseImage.rightBottom = viewBasePosition;
      measuringTape.baseImage.rotateAround( measuringTape.baseImage.rightBottom, angle );

      // reset the text
      measuringTape.tipToBaseDistance = tipPosition.distance( basePosition );
      measuringTape.labelText.setText( measuringTape.getText() );
      measuringTape.labelText.centerTop = measuringTape.baseImage.center.plus( options.textPosition.times( options.baseScale ) );

      // reposition the tapeline
      tapeLine.setLine( viewBasePosition.x, viewBasePosition.y, viewTipPosition.x, viewTipPosition.y );

      // rotate the crosshairs
      if ( options.isTipCrosshairRotating ) {
        tip.rotateAround( viewTipPosition, deltaAngle );
      }
      if ( options.isBaseCrosshairRotating ) {
        baseCrosshair.rotateAround( viewBasePosition, deltaAngle );
      }
    };

    // link the positions of base and tip to the measuring tape to the scenery update function
    Property.multilink( [ this.basePositionProperty, this.tipPositionProperty ], function( basePosition, tipPosition ) {
      measuringTape.updatePosition( basePosition, tipPosition );
    } );

    // @private
    this.isVisiblePropertyObserver = function( isVisible ) {
      measuringTape.visible = isVisible;
    };
    this.isVisibleProperty.link( this.isVisiblePropertyObserver ); // must be unlinked in dispose

    // @private set Text on on labelText
    this.unitsPropertyObserver = function() {
      measuringTape.labelText.setText( measuringTape.getText() );
    };
    // link change of units to the text
    this.unitsProperty.link( this.unitsPropertyObserver ); // must be unlinked in dispose

    this.mutate( options );

    this.tandem && this.tandem.addInstance( this );
  }

  sceneryPhet.register( 'MeasuringTape', MeasuringTape );

  return inherit( Node, MeasuringTape, {
    /**
     * Resets the MeasuringTape to its initial configuration
     * @public
     */
    reset: function() {
      this.basePositionProperty.reset();
      this.tipPositionProperty.reset();
    },

    /**
     * Ensures that this node is subject to garbage collection
     * @public
     */
    dispose: function() {
      this.isVisibleProperty.unlink( this.isVisiblePropertyObserver );
      this.unitsProperty.unlink( this.unitsPropertyObserver );
      this.tandem && this.tandem.removeInstance( this );
    },

    /**
     * Returns a readout of the current measurement
     * @public
     * @returns {string}
     */
    getText: function() {
      return Util.toFixed( this.unitsProperty.value.multiplier * this.tipToBaseDistance,
          this.significantFigures ) + ' ' + this.unitsProperty.value.name;
    },

    /**
     * Sets the color of the text label
     * @public
     * @param {string||Color} color
     */
    setTextColor: function( color ) {
      this.labelText.fill = color;
    },

    /**
     * Sets the visibility of the text label
     * @public
     * @param {boolean} visible
     */
    setTextVisibility: function( visible ) {
      this.labelText.visible = visible;
    },

    /**
     * Returns a property indicating if the tip of the measuring tape is being dragged or not
     * @public
     * @returns {Property.<boolean>}
     */
    getIsTipUserControlledProperty: function() {
      return this._isTipUserControlledProperty;
    },

    /**
     * Returns a property indicating if the baseImage of the measuring tape is being dragged or not
     * @public
     * @returns {Property.<boolean>}
     */
    getIsBaseUserControlledProperty: function() {
      return this._isBaseUserControlledProperty;
    },

    /**
     * Sets the property indicating if the tip of the measuring tape is being dragged or not.
     * (Useful to set externally if using a creator node to generate the measuringTape)
     * @public
     * @param {boolean} value
     */
    setIsBaseUserControlledProperty: function( value ) {
      this._isBaseUserControlledProperty.set( value );
    },

    /**
     * Sets the property indicating if the tip of the measuring tape is being dragged or not
     * @public
     * @param {boolean} value
     */
    setIsTipUserControlledProperty: function( value ) {
      this._isBaseUserControlledProperty.set( value );
    },

    /**
     * Sets the dragBounds of the of the measuringTape.
     * In addition, it forces the tip and base of the measuring tape to be within the new bounds.
     * @public
     * @param {Bounds2} dragBounds
     */
    setDragBounds: function( dragBounds ) {
      this._dragBounds = dragBounds.copy();
      // sets the base position of the measuring tape, which may have changed if it was outside of the dragBounds
      this.basePositionProperty.set( this._dragBounds.closestPointTo( this.basePositionProperty.value ) );
      // sets a new tip position if the tip of the measuring tape is subject to dragBounds
      if ( this.isTipDragBounded ) {
        this.tipPositionProperty.set( this._dragBounds.closestPointTo( this.tipPositionProperty.value ) );
      }
    },

    /**
     * Returns the dragBounds of the sim.
     * @public
     * @returns {Bounds2}
     */
    getDragBounds: function() {
      return this._dragBounds;
    },

    /**
     * Sets the modelViewTransform.
     * @public
     * @param {ModelViewTransform2} modelViewTransform
     */
    setModelViewTransform: function( modelViewTransform ) {
      this._modelViewTransform = modelViewTransform;
      this.updatePosition( this.basePositionProperty.value, this.tipPositionProperty.value );
    },

    /**
     * Gets the modelViewTransform.
     * @public
     * @returns {ModelViewTransform2}
     */
    getModelViewTransform: function() {
      return this._modelViewTransform;
    },

    /**
     * Returns the center of the base in the measuring tape's local coordinate frame.
     * @public
     *
     * @returns {Vector2}
     */
    getLocalBaseCenter: function() {
      return new Vector2( -this.baseImage.imageWidth / 2, -this.baseImage.imageHeight / 2 );
    },

    /**
     * Returns the bounding box of the measuring tape's base within its local coordinate frame
     * @public
     *
     * @returns {Bounds2}
     */
    getLocalBaseBounds: function() {
      return this.baseImage.bounds.copy();
    },

    /**
     * Initiates a drag of the base (whole measuring tape) from a Scenery event.
     * @public
     *
     * @param {Event} event
     */
    startBaseDrag: function( event ) {
      this.baseDragHandler.startDrag( event );
    },

    // @public ES5 getter and setter for the textColor
    set textColor( value ) { this.setTextColor( value ); },
    get textColor() { return this.labelText.fill; },

    // @public ES5 getter and setter for the modelViewTransform
    set modelViewTransform( modelViewTransform ) { this._modelViewTransform = modelViewTransform; },
    get modelViewTransform() { return this._modelViewTransform; },

    // @public ES5 getter and setter for the dragBounds
    set dragBounds( value ) { this.setDragBounds( value ); },
    get dragBounds() { return this.getDragBounds(); },

    // @public ES5 getters and setters
    get isBaseUserControlledProperty() { return this.getIsBaseUserControlledProperty(); },
    get isTipUserControlledProperty() { return this.getIsTipUserControlledProperty(); },

    // @public
    set isBaseUserControlledProperty( value ) { return this.setIsBaseUserControlledProperty( value ); },
    set isTipUserControlledProperty( value ) { return this.setIsTipUserControlledProperty( value ); }
  }, {

    /**
     * Returns an icon of the measuring tape
     * @param {Object} [options]
     * @returns {Image}
     * @static
     * @public
     */
    createMeasuringTapeIcon: function( options ) {

      // procedure to create an icon Image of a measuringTape
      // first, create an actual measuring tape
      var unspooledMeterTape = 30; // in view coordinates
      var measuringTape = new MeasuringTape( new Property( { name: '', multiplier: 1 } ), new Property( true ), _.extend( {
        tipPositionProperty: new Property( new Vector2( unspooledMeterTape, 0 ) )
      }, options ) );
      measuringTape.setTextVisibility( false ); // let's hide the text label value (the length) for the icon

      // second, create the measuringTape icon
      var measuringTapeIcon = new Node( { children: [ measuringTape ] } );

      // Create the measuringTape icon using toImage
      measuringTape.toImage( function( image ) {
        measuringTapeIcon.children = [ new Image( image ) ];
      } );

      return measuringTapeIcon.children[ 0 ];
    }
  } );
} );
