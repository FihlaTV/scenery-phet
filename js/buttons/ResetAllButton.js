// Copyright 2013-2020, University of Colorado Boulder

/**
 * Reset All button, typically used to reset everything ('reset all') on a Screen.
 * Extends ResetButton, adding things that are specific to 'reset all'.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const ActivationUtterance = require( 'UTTERANCE_QUEUE/ActivationUtterance' );
  const BooleanIO = require( 'TANDEM/types/BooleanIO' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DerivedPropertyIO = require( 'AXON/DerivedPropertyIO' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const ResetAllButtonIO = require( 'SCENERY_PHET/buttons/ResetAllButtonIO' );
  const ResetButton = require( 'SCENERY_PHET/buttons/ResetButton' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const RESET_ALL_BUTTON_RADIUS = 20.8;

  // sounds
  const resetAllSoundPlayer = require( 'TAMBO/shared-sound-players/resetAllSoundPlayer' );

  // a11y strings - not translatable
  const resetAllButtonNameString = SceneryPhetA11yStrings.resetAllLabelString.value;
  const resetAllAlertString = SceneryPhetA11yStrings.resetAllAlertString.value;

  /**
   * @param {Object} [options]
   * @constructor
   */
  function ResetAllButton( options ) {

    options = merge( {
      radius: RESET_ALL_BUTTON_RADIUS,

      // Fine tuned in https://github.com/phetsims/tasks/issues/985 and should not be overriden lightly
      touchAreaDilation: 5.2,
      baseColor: PhetColorScheme.RESET_ALL_BUTTON_BASE_COLOR,
      arrowColor: 'white',
      listener: _.noop, // {function}

      // {boolean} - option specific to ResetAllButton. If true, then the reset all button will reset back to the
      // previous PhET-iO state, if applicable.
      phetioRestoreScreenStateOnReset: false,
      tandem: Tandem.REQUIRED,
      phetioDocumentation: 'The orange, round button that can be used to restore the initial state',
      phetioType: ResetAllButtonIO,

      // sound generation
      soundPlayer: resetAllSoundPlayer,

      // a11y
      innerContent: resetAllButtonNameString
    }, options );

    const oldListener = options.listener;

    options.listener = () => {
      oldListener();

      // every ResetAllButton has the option to reset to the last PhET-iO state if desired.
      if ( options.phetioRestoreScreenStateOnReset && _.hasIn( window, 'phet.phetIo.phetioEngine' ) ) {
        phet.phetIo.phetioEngine.phetioStateEngine.restoreStateForScreen( options.tandem );
      }
    };

    ResetButton.call( this, options );

    // @private - Mirrored property of `buttonModel.isFiringProperty`, but is phet-io instrumented.
    this.isFiringProperty = new DerivedProperty( [ this.buttonModel.isFiringProperty ], function( a ) { return a; }, {
      tandem: options.tandem.createTandem( 'isFiringProperty' ),
      phetioDocumentation: 'Temporarily becomes true while the Reset All button is firing.  Commonly used to disable audio effects during reset.',
      phetioType: DerivedPropertyIO( BooleanIO ),
      phetioState: false // this is a transient property based on user interaction, should not be stored in the state
    } );

    // a11y - when reset all button is fired, disable alerts so that there isn't an excessive stream of alerts
    // while many Properties are reset. When callbacks are ended for reset all, enable alerts again and announce an
    // alert that everything was reset.
    const resetUtterance = new ActivationUtterance( { alert: resetAllAlertString } );
    this.isFiringProperty.lazyLink( function( isFiring ) {
      phet.joist.sim.utteranceQueue.enabled = !isFiring;

      if ( isFiring ) {
        phet.joist.sim.utteranceQueue.clear();
      }
      else {
        phet.joist.sim.utteranceQueue.addToBack( resetUtterance );
      }
    } );
  }

  sceneryPhet.register( 'ResetAllButton', ResetAllButton );

  return inherit( ResetButton, ResetAllButton, {

    /**
     * Make eligible for garbage collection.
     * @public
     */
    dispose: function() {

      this.isFiringProperty.dispose();

      ResetButton.prototype.dispose.call( this );
    }
  } );
} );
