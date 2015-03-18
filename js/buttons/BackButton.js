// Copyright 2002-2014, University of Colorado Boulder

/**
 * Button for returning to the level selection screen, which shows a "back" arrow, i.e., an arrow pointing to the left.
 * (Note the original version had a star icon.)
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var Path = require( 'SCENERY/nodes/Path' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function BackButton( options ) {

    options = _.extend( {

      // Default margin values were set up to make this button match the size of the refresh button, since these
      // buttons often appear together.  See see https://github.com/phetsims/scenery-phet/issues/44.
      xMargin: 8,
      yMargin: 10.9,

      // Default base code matches the yellow in the PhET logo (the one with the paper airplane).
      baseColor: new Color( 242, 233, 22 )

    }, options );

    var arrowShape = new ArrowShape( 0, 0, -28.5, 0, {
      tailWidth: 8,
      headWidth: 18,
      headHeight: 15
    } );

    RectangularPushButton.call( this, _.extend( {
      content: new Path( arrowShape, { fill: 'black', pickable: false } )
    }, options ) );
  }

  return inherit( RectangularPushButton, BackButton );
} );