// Copyright 2016, University of Colorado Boulder
define( function( require ) {
  'use strict';

  // modules
  var AbstractKey = require( 'SCENERY_PHET/AbstractKey' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  function IntegerKey( integerRep ) {
    AbstractKey.call( this, integerRep, parseInt( integerRep, 10 ), integerRep );
  }

  sceneryPhet.register( 'IntegerKey', IntegerKey );
  return inherit( AbstractKey, IntegerKey, {
    handleKeyPressed: function( array ){
      var newArray = _.clone( array );
      newArray.push( this );
      return newArray;
    }


  } );
} );