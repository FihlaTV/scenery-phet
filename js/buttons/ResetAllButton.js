// Copyright 2013-2017, University of Colorado Boulder

/**
 * Reset All button, typically used to reset everything ('reset all') on a Screen.
 * Extends ResetButton, adding things that are specific to 'reset all'.
 *
 * @author John Blanco
 * @author Chris Malley
 */
define( function( require ) {
  'use strict';

  // modules
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );
  var UtteranceQueue = require( 'SCENERY_PHET/accessibility/UtteranceQueue' );
  var ResetButton = require( 'SCENERY_PHET/buttons/ResetButton' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );
  var TResetAllButton = require( 'SUN/buttons/TResetAllButton' );
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  var RESET_ALL_BUTTON_RADIUS = 24; // derived from the image files that were originally used for this button

  // strings
  var resetAllButtonNameString = require( 'string!SCENERY_PHET/ResetAllButton.name' );

  // a11y strings - not translatable
  var resetAllAlertString = SceneryPhetA11yStrings.resetAllAlertString;

  /**
   * @param {Object} [options]
   * @constructor
   */
  function ResetAllButton( options ) {

    options = _.extend( {
      radius: RESET_ALL_BUTTON_RADIUS,
      baseColor: PhetColorScheme.RESET_ALL_BUTTON_BASE_COLOR,
      arrowColor: 'white',
      tandem: Tandem.tandemRequired(),
      phetioType: TResetAllButton,

      // a11y
      tagName: 'input',
      inputType: 'button',
      accessibleLabel: resetAllButtonNameString,
      useAriaLabel: true
    }, options );

    var tandem = options.tandem;
    options.tandem = tandem.createSupertypeTandem();

    ResetButton.call( this, options );

    this.focusHighlight = new Shape().circle( 0, 0, options.radius + 5 );

    // a11y - when reset all button is fired, disable alerts so that there isn't an excessive stream of alerts
    // while many properties are reset
    var disableAlertsListener = function() {
      UtteranceQueue.setMuted= true;
    };
    this.buttonModel.startedCallbacksForFiredEmitter.addListener( disableAlertsListener );

    // a11y - when callbacks are ended for reset all, enable alerts again and announce an alert that everything
    // was reset
    var enableAlertsListener = function() {
      UtteranceQueue.clear();

      UtteranceQueue.setMuted= false;
      UtteranceQueue.addToBack( new Utterance( resetAllAlertString, {
          typeId: 'resetAllButtonAlert'
      } ) );
    };
    this.buttonModel.endedCallbacksForFiredEmitter.addListener( enableAlertsListener );

    // @private
    this.disposeResetAllButton = function() {
      self.buttonModel.startedCallbacksForFiredEmitter.removeListener( disableAlertsListener );
      self.buttonModel.endedCallbacksForFiredEmitter.removeListener( enableAlertsListener );
    };

    this.mutate( {
      tandem: tandem,
      phetioType: options.phetioValueType
    } );
  }

  sceneryPhet.register( 'ResetAllButton', ResetAllButton );

  return inherit( ResetButton, ResetAllButton, {

    /**
     * Make eligible for garbage collection.
     * @public
     */
    dispose: function() {
      this.disposeResetAllButton();
      ResetButton.prototype.dispose && ResetButton.prototype.dispose.call( this );
    }
  } );
} );
