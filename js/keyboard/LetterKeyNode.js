// Copyright 2017, University of Colorado Boulder

/**
 * Node that looks like a keyboard key with a single letter. By default, a letter key is square, with a bit less
 * horizontal padding than a key with a full word.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var TextKeyNode = require( 'SCENERY_PHET/keyboard/TextKeyNode' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  /**
   * Constructor.
   *
   * @param {string} string - the letter for the key
   * @param {Object} options
   */
  function LetterKeyNode( string, options ) {

    options = _.extend( {
      xPadding: 5,
      forceSquareKey: true
    }, options );

    TextKeyNode.call( this, string, options );
    console.log( this.width );
  }

  sceneryPhet.register( 'LetterKeyNode', LetterKeyNode );

  return inherit( TextKeyNode, LetterKeyNode );

} );
