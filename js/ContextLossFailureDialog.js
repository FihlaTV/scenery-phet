// Copyright 2015-2017, University of Colorado Boulder

/**
 * Failure message displayed when a WebGL context loss is experienced and we can't recover. Offers a button to reload
 * the simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Dialog = require( 'SUN/Dialog' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );

  // strings
  var webglWarningContextLossFailureString = require( 'string!SCENERY_PHET/webglWarning.contextLossFailure' );
  var webglWarningContextLossReloadString = require( 'string!SCENERY_PHET/webglWarning.contextLossReload' );

  /**
   *
   * @constructor
   */
  function ContextLossFailureDialog( options ) {

    options = _.extend( {

      // Provided as an option so that scenery-phet demo app can test without causing automated-testing failures.
      // See https://github.com/phetsims/scenery-phet/issues/375
      reloadButtonListener: function() {
        window.location.reload();
      }

    }, options );

    Tandem.indicateUninstrumentedCode();

    var warningSign = new FontAwesomeNode( 'warning_sign', {
      fill: '#E87600', // "safety orange", according to Wikipedia
      scale: 0.6
    } );

    var text = new Text( webglWarningContextLossFailureString, { font: new PhetFont( 12 ) } );

    var button = new TextPushButton( webglWarningContextLossReloadString, {
      font: new PhetFont( 12 ),
      baseColor: '#E87600',
      listener: options.reloadButtonListener
    } );

    Dialog.call( this, new HBox( {
      children: [ warningSign, text, button ],
      spacing: 10
    } ), {
      // margins large enough to make space for close button, see https://github.com/phetsims/scenery-phet/issues/373
      xMargin: 50,
      yMargin: 30
    } );
  }

  sceneryPhet.register( 'ContextLossFailureDialog', ContextLossFailureDialog );

  return inherit( Dialog, ContextLossFailureDialog );
} );
