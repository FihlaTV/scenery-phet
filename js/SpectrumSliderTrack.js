// Copyright 2019, University of Colorado Boulder

/**
 * This SliderTrack depicts a spectrum of colors in the track.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Dimension2 = require( 'DOT/Dimension2' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const SliderTrack = require( 'SUN/SliderTrack' );
  const SpectrumNode = require( 'SCENERY_PHET/SpectrumNode' );

  class SpectrumSliderTrack extends SliderTrack {

    /**
     * @param {Property.<number>} property
     * @param {Range} range
     * @param {Object} [options]
     */
    constructor( property, range, options ) {
      options = _.extend( {
        size: new Dimension2( 150, 30 ),
        valueToColor: SpectrumNode.DEFAULT_VALUE_TO_COLOR // Defaults to a black to white gradient
      }, options );

      const spectrumNode = new SpectrumNode( {
        minValue: range.min,
        maxValue: range.max,
        size: options.size,
        valueToColor: options.valueToColor
      } );

      // Show a thin black stroke around the border
      spectrumNode.addChild( new Rectangle( 0, 0, spectrumNode.width, spectrumNode.height, {
        stroke: 'black',
        lineWidth: 1
      } ) );
      super( spectrumNode, property, range, options );
    }
  }

  return sceneryPhet.register( 'SpectrumSliderTrack', SpectrumSliderTrack );
} );