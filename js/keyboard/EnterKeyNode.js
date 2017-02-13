// Copyright 2017, University of Colorado Boulder

/**
 * Node that looks like a 'Enter' key on a keyboard.  By default, the Enter key is
 * more rectangular than a letter key, and the text content is aligned
 * in the right top corner.
 * 
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var TextKeyNode = require( 'SCENERY_PHET/keyboard/TextKeyNode' );
  var SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );

  // strings (a11y strings are not translatable yet, see SceneryPhetA11yStrings for more details)
  var enterString = SceneryPhetA11yStrings.enterString;

  /**
   * Constructor.
   * 
   * @param {Object} [options]
   */
  function EnterKeyNode( options ) {
    // Tandem.indicateUninstrumentedCode();  // see https://github.com/phetsims/phet-io/issues/986
    // Instrumentation provided by Node, further customization is probably not necessary

    options = _.extend( {
      minKeyWidth: 62, // in ScreenView coordinates
      maxKeyWidth: 62,

      xAlign: 'right',
      yAlign: 'top'
    }, options );

    TextKeyNode.call( this, enterString, options );
  }

  sceneryPhet.register( 'EnterKeyNode', EnterKeyNode );

  return inherit( TextKeyNode, EnterKeyNode );

} );
