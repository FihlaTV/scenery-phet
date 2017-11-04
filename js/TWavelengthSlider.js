// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  /**
   * Wrapper type for phet/scenery-phet's WavelengthSlider class.
   * @param slider
   * @param phetioID
   * @constructor
   */
  function TWavelengthSlider( slider, phetioID ) {
    assert && assertInstanceOf( slider, phet.sceneryPhet.WavelengthSlider );
    TNode.call( this, slider, phetioID );
  }

  phetioInherit( TNode, 'TWavelengthSlider', TWavelengthSlider, {}, {
    documentation: 'A slider that shows wavelengths for selection'
  } );

  sceneryPhet.register( 'TWavelengthSlider', TWavelengthSlider );

  return TWavelengthSlider;
} );

