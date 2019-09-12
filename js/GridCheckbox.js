// Copyright 2019, University of Colorado Boulder

/**
 * Checkbox for showing/hiding grid lines for a graph.
 * See https://github.com/phetsims/graphing-lines/issues/91.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Checkbox = require( 'SUN/Checkbox' );
  const Path = require( 'SCENERY/nodes/Path' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Shape = require( 'KITE/Shape' );

  class GridCheckbox extends Checkbox {

    /**
     * @param {Property.<boolean>} property
     * @param {Object} [options]
     */
    constructor( property, options ) {

      options = _.extend( {

        // options for the grid icon
        gridSize: 30, // {number} square grid with this width and height
        gridStroke: 'rgb( 100, 100, 100 )',
        gridLineWidth: 1,

        // superclass options
        spacing: 10

      }, options );

      const iconSize = options.gridSize;

      // The grid shape looks approximately like this:
      //
      //      |   |   |
      //   ---|---|---|---
      //      |   |   |
      //   ---|---|---|---
      //      |   |   |
      //   ---|---|---|---
      //      |   |   |
      //
      const iconShape = new Shape()
        .moveTo( iconSize / 4, 0 )
        .lineTo( iconSize / 4, iconSize )
        .moveTo( iconSize / 2, 0 )
        .lineTo( iconSize / 2, iconSize )
        .moveTo( iconSize * 3 / 4, 0 )
        .lineTo( iconSize * 3 / 4, iconSize )
        .moveTo( 0, iconSize / 4 )
        .lineTo( iconSize, iconSize / 4 )
        .moveTo( 0, iconSize / 2 )
        .lineTo( iconSize, iconSize / 2 )
        .moveTo( 0, iconSize * 3 / 4 )
        .lineTo( iconSize, iconSize * 3 / 4 );

      const iconNode = new Path( iconShape, {
        stroke: options.gridStroke,
        lineWidth: options.lineWidth
      } );

      super( iconNode, property, options );
    }
  }

  return sceneryPhet.register( 'GridCheckbox', GridCheckbox );
} );