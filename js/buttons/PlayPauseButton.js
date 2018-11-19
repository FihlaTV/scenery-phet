// Copyright 2014-2018, University of Colorado Boulder

/**
 * Play pause button for starting/stopping the sim.  Often appears at the bottom center of the screen.
 * Generated programmatically using RoundPushButton (as opposed to using raster images).
 *
 * @author Sam Reid
 */

define( function( require ) {
  'use strict';

  // modules
  var BooleanRoundToggleButton = require( 'SUN/buttons/BooleanRoundToggleButton' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );
  var Shape = require( 'KITE/Shape' );

  // a11y strings
  var playString = SceneryPhetA11yStrings.playString.value;
  var pauseString = SceneryPhetA11yStrings.pauseString.value;
  var playDescriptionString = SceneryPhetA11yStrings.playDescriptionString.value;
  var pauseDescriptionString = SceneryPhetA11yStrings.pauseDescriptionString.value;

  // constants
  var DEFAULT_RADIUS = 28;

  /**
   * @param {Property.<boolean>} isPlayingProperty
   * @param {Object} [options]
   * @constructor
   */
  function PlayPauseButton( isPlayingProperty, options ) {
    var self = this;

    options = _.extend( {
      radius: DEFAULT_RADIUS,
      containerTagName: 'div',
      a11yPauseDescription: pauseDescriptionString,
      a11yPlayDescription: playDescriptionString
    }, options );

    this.isPlayingProperty = isPlayingProperty; // @private

    // play and pause symbols are sized relative to the radius
    var triangleHeight = options.radius;
    var triangleWidth = options.radius * 0.8;
    var barWidth = options.radius * 0.2;
    var barHeight = triangleHeight;
    var playPath = new Path( new Shape().moveTo( 0, triangleHeight / 2 ).lineTo( triangleWidth, 0 ).lineTo( 0, -triangleHeight / 2 ).close(), { fill: 'black' } );

    var pauseIconShape = new Shape()
      .rect( 0, 0, barWidth, barHeight )
      .rect( 2 * barWidth, 0, barWidth, barHeight );
    var pausePath = new Path( pauseIconShape, { fill: 'black' } );

    // put the play and pause symbols inside circles so they have the same bounds,
    // otherwise BooleanToggleNode will re-adjust their positions relative to each other
    var playCircle = new Circle( options.radius );
    playPath.centerX = options.radius * 0.05; // move to right slightly since we don't want it exactly centered
    playPath.centerY = 0;
    playCircle.addChild( playPath );

    var pausedCircle = new Circle( options.radius );
    pausePath.centerX = 0;
    pausePath.centerY = 0;
    pausedCircle.addChild( pausePath );

    BooleanRoundToggleButton.call( this, pausedCircle, playCircle, isPlayingProperty, options );

    var runningListener = function( running ) {
      self.innerContent = running ? pauseString : playString;
      self.descriptionContent = running ? options.a11yPauseDescription : options.a11yPlayDescription;
    };
    isPlayingProperty.link( runningListener );

    // @private
    this.disposePlayPauseButton = function() {
      if ( isPlayingProperty.hasListener( runningListener ) ) {
        isPlayingProperty.unlink( runningListener );
      }
    };
  }

  sceneryPhet.register( 'PlayPauseButton', PlayPauseButton );

  return inherit( BooleanRoundToggleButton, PlayPauseButton, {

    /**
     * @public
     * @override
     */
    dispose: function() {
      this.disposePlayPauseButton();
      BooleanRoundToggleButton.prototype.dispose.call( this );
    }
  } );
} );