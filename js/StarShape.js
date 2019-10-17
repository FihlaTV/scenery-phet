// Copyright 2014-2019, University of Colorado Boulder

/**
 * Star shape (full, 5-pointed)
 *
 * @author Sam Reid
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Shape = require( 'KITE/Shape' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function StarShape( options ) {

    const self = this;

    options = merge( {

      // Distance from the center to the tip of a star limb
      outerRadius: 15,

      // Distance from the center to the closest point on the exterior of the star.  Sets the "thickness" of the star limbs
      innerRadius: 7.5,

      // Number of star points, must be an integer
      numberStarPoints: 5
    }, options );

    Shape.call( this );

    const numSegments = 2 * options.numberStarPoints; // number of segments

    // start at the top and proceed clockwise
    _.times( numSegments, function( i ) {
      const angle = i / numSegments * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? options.outerRadius : options.innerRadius;

      self.lineTo(
        radius * Math.cos( angle ),
        radius * Math.sin( angle )
      );
    } );
    this.close();
    this.makeImmutable(); // So Paths won't need to add listeners
  }

  sceneryPhet.register( 'StarShape', StarShape );

  return inherit( Shape, StarShape );
} );
