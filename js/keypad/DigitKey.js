// Copyright 2016, University of Colorado Boulder

/**
 * DigitKey Class derived from AbstractKey class. Handles Single Digit only.
 *
 * When this key is pressed it adds the instance of the class at the end of the accumulated keys array.
 *
 * @author Aadish Gupta
 */

define( function( require ) {
  'use strict';

  // modules
  var AbstractKey = require( 'SCENERY_PHET/keypad/AbstractKey' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  /**
   * @param {number} digit
   * @constructor
   */
  function DigitKey( digit ) {
    assert && assert( !isNaN( digit ) && digit >= 0 && digit <= 9, 'digit must be a number between 0 and 9' );
    AbstractKey.call( this, digit.toString(), digit, digit );
  }

  sceneryPhet.register( 'DigitKey', DigitKey );

  return inherit( AbstractKey, DigitKey, {

    /**
     * @override
     * @param keyAccumulator
     * @returns {Array.<AbstractKey>}
     * @public
     */
    handleKeyPressed: function( keyAccumulator ) {
      var newArray;
      if ( keyAccumulator.getClearOnNextKeyPress() ) {
        newArray = [];
        keyAccumulator.setClearOnNextKeyPress( false );
      }
      else{
        newArray = _.clone( keyAccumulator.accumulatedKeysProperty.get() );
      }
      newArray.push( this );
      return newArray;
    }

  } );
} );