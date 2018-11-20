// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for WavelengthSlider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var WavelengthSlider = require( 'SCENERY_PHET/WavelengthSlider' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );

  /**
   * IO type for phet/scenery-phet's WavelengthSlider class.
   * @param {WavelengthSlider} slider
   * @param {string} phetioID
   * @constructor
   */
  function WavelengthSliderIO( slider, phetioID ) {
    assert && assertInstanceOf( slider, WavelengthSlider );
    NodeIO.call( this, slider, phetioID );
  }

  phetioInherit( NodeIO, 'WavelengthSliderIO', WavelengthSliderIO, {}, {
    documentation: 'A slider that shows wavelengths for selection'
  } );

  sceneryPhet.register( 'WavelengthSliderIO', WavelengthSliderIO );

  return WavelengthSliderIO;
} );

