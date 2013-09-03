// Copyright 2002-2013, University of Colorado Boulder

/*
 * The hole of a bucket
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Shape = require( 'KITE/Shape' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );

  var BucketHole = function BucketHole( bucket, mvt ) {
    Node.call( this );

    // TODO: scaleOnlyTransform is kind of weird, discuss with rest of team.
    var scaleOnlyTransform = ModelViewTransform2.createOffsetXYScaleMapping( { x: 0, y: 0 }, mvt.getMatrix().m00(), mvt.getMatrix().m11() );
    var transformedShape = scaleOnlyTransform.modelToViewShape( bucket.holeShape );
    var gradientPaint = new LinearGradient( transformedShape.bounds.getMinX(), 0, transformedShape.bounds.getMaxX(), 0 );
    gradientPaint.addColorStop( 0, 'black' );
    gradientPaint.addColorStop( 1, '#c0c0c0' );

    this.addChild( new Path( transformedShape, {
      fill: gradientPaint,
      stroke: '#777',
      lineWidth: 1
    } ) );

    // Set initial position.
    this.translation = mvt.modelToViewPosition( bucket.position );
  };

  inherit( Node, BucketHole );

  return BucketHole;
} );
