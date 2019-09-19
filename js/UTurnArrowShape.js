// Copyright 2014-2018, University of Colorado Boulder

/**
 * U-Turn arrow shape, for use with "reset" or "undo" purposes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Shape = require( 'KITE/Shape' );

  /**
   * @param {number} size A size factor (it'll be a bit bigger)
   * @constructor
   */
  function UTurnArrowShape( size ) {
    Shape.call( this );

    const strokeWidth = size * 0.3;
    const strokeOffset = strokeWidth / 2;
    const mainWidth = size * 0.6;
    const mainHeight = size;
    const headWidth = size * 0.5;
    const headHeight = size * 0.75;
    const halfHeadWidth = headWidth / 2;
    const halfHeadHeight = headHeight / 2;

    // starts adjacent to the arrowhead on the top, going clockwise
    this.moveTo( halfHeadWidth, -strokeOffset );
    this.lineTo( mainWidth, -strokeOffset );
    // arc (mainWidth,-strokeOffset) => (mainWidth,mainHeight+strokeOffset)
    this.arc( mainWidth, mainHeight / 2, mainHeight / 2 + strokeOffset, -Math.PI / 2, Math.PI / 2, false );
    this.lineTo( 0, mainHeight + strokeOffset );
    this.lineTo( 0, mainHeight - strokeOffset );
    this.lineTo( mainWidth, mainHeight - strokeOffset );
    // arc (mainWidth,mainHeight-strokeOffset) => (mainWidth,strokeOffset)
    this.arc( mainWidth, mainHeight / 2, mainHeight / 2 - strokeOffset, Math.PI / 2, -Math.PI / 2, true );
    this.lineTo( halfHeadWidth, strokeOffset );
    // three lines of the arrow head
    this.lineTo( halfHeadWidth, halfHeadHeight );
    this.lineTo( -halfHeadWidth, 0 );
    this.lineTo( halfHeadWidth, -halfHeadHeight );
    this.close();
  }

  sceneryPhet.register( 'UTurnArrowShape', UTurnArrowShape );

  return inherit( Shape, UTurnArrowShape );
} );
