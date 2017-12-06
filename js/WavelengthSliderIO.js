// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  /**
   * Wrapper type for phet/scenery-phet's WavelengthSlider class.
   * @param slider
   * @param phetioID
   * @constructor
   */
  function WavelengthSliderIO( slider, phetioID ) {
    assert && assertInstanceOf( slider, phet.sceneryPhet.WavelengthSlider );
    NodeIO.call( this, slider, phetioID );
  }

  phetioInherit( NodeIO, 'WavelengthSliderIO', WavelengthSliderIO, {}, {
    documentation: 'A slider that shows wavelengths for selection'
  } );

  sceneryPhet.register( 'WavelengthSliderIO', WavelengthSliderIO );

  return WavelengthSliderIO;
} );
