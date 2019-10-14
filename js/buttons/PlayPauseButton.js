// Copyright 2014-2019, University of Colorado Boulder

/**
 * Play pause button for starting/stopping the sim.  Often appears at the bottom center of the screen.
 * Generated programmatically using RoundPushButton (as opposed to using raster images).
 *
 * @author Sam Reid
 */
define( require => {
  'use strict';

  // modules
  const BooleanRoundToggleButton = require( 'SUN/buttons/BooleanRoundToggleButton' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const commonSoundPlayers = require( 'TAMBO/commonSoundPlayers' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PauseIconShape = require( 'SCENERY_PHET/PauseIconShape' );
  const PlayIconShape = require( 'SCENERY_PHET/PlayIconShape' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );

  // a11y strings
  const playString = SceneryPhetA11yStrings.playString.value;
  const pauseString = SceneryPhetA11yStrings.pauseString.value;
  const playDescriptionString = SceneryPhetA11yStrings.playDescriptionString.value;
  const pauseDescriptionString = SceneryPhetA11yStrings.pauseDescriptionString.value;

  // constants
  const DEFAULT_RADIUS = 28;

  /**
   * @param {Property.<boolean>} isPlayingProperty
   * @param {Object} [options]
   * @constructor
   */
  function PlayPauseButton( isPlayingProperty, options ) {
    const self = this;

    options = _.extend( {
      radius: DEFAULT_RADIUS,
      containerTagName: 'div',
      a11yPauseDescription: pauseDescriptionString,
      a11yPlayDescription: playDescriptionString,

      // turn off default sound, since this type will do its own sound generation
      soundPlayer: null,

      // sounds to be played on play/pause transitions,
      playSound: commonSoundPlayers.playButton,
      pauseSound: commonSoundPlayers.pauseButton
    }, options );

    this.isPlayingProperty = isPlayingProperty; // @private

    // play and pause icons are sized relative to the radius
    const playHeight = options.radius;
    const playWidth = options.radius * 0.8;
    const playPath = new Path( new PlayIconShape( playWidth, playHeight ), { fill: 'black' } );
    const pausePath = new Path( new PauseIconShape( 0.75 * playWidth, playHeight ), { fill: 'black' } );

    // put the play and pause symbols inside circles so they have the same bounds,
    // otherwise BooleanToggleNode will re-adjust their positions relative to each other
    const playCircle = new Circle( options.radius );
    playPath.centerX = options.radius * 0.05; // move to right slightly since we don't want it exactly centered
    playPath.centerY = 0;
    playCircle.addChild( playPath );

    const pausedCircle = new Circle( options.radius );
    pausePath.centerX = 0;
    pausePath.centerY = 0;
    pausedCircle.addChild( pausePath );

    BooleanRoundToggleButton.call( this, pausedCircle, playCircle, isPlayingProperty, options );

    const isPlayingListener = function( running ) {
      self.innerContent = running ? pauseString : playString;
      self.descriptionContent = running ? options.a11yPauseDescription : options.a11yPlayDescription;
    };
    isPlayingProperty.link( isPlayingListener );

    // sound generation
    var playSounds = function() {
      const playing = isPlayingProperty.value;
      if ( playing && options.playSound ) {
        options.playSound.play();
      }
      else if ( !playing && options.pauseSound ) {
        options.pauseSound.play();
      }
    };
    this.buttonModel.produceSoundEmitter.addListener( playSounds );

    // @private
    this.disposePlayPauseButton = function() {
      if ( isPlayingProperty.hasListener( isPlayingListener ) ) {
        isPlayingProperty.unlink( isPlayingListener );
      }
      if ( isPlayingProperty.hasListener( playSounds ) ) {
        isPlayingProperty.unlink( playSounds );
      }
      this.buttonModel.produceSoundEmitter.removeListener( playSounds );
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'PlayPauseButton', this );
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