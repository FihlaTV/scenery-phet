// Copyright 2013-2019, University of Colorado Boulder

/**
 * An arrow shape, either single or double headed.
 * ArrowShape has an optimization that allows you to reuse an array of Vector2.
 * The array will have 0 points if the tail and tip are the same point.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Aaron Davis
 * @author Sam Reid
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {number} tailX
   * @param {number} tailY
   * @param {number} tipX
   * @param {number} tipY
   * @param {Object} [options]
   * @constructor
   */
  function ArrowShape( tailX, tailY, tipX, tipY, options ) {

    options = merge( {
      tailWidth: 5,
      headWidth: 10,
      headHeight: 10,
      doubleHead: false, // determines whether the arrow has a head at both ends of the tail
      isHeadDynamic: false, // determines whether to scale down the arrow head height for fractionalHeadHeight constraint
      scaleTailToo: false,  // determines whether to also scale arrow head width and tail width when scaling head height
      fractionalHeadHeight: 0.5 // head will be scaled when head size is greater than fractionalHeadHeight * arrow length
    }, options );

    const self = this;
    Shape.call( this );

    if ( tipX !== tailX || tipY !== tailY ) {

      const points = ArrowShape.getArrowShapePoints( tailX, tailY, tipX, tipY, [], options );

      // Describe the shape
      this.moveTo( points[ 0 ].x, points[ 0 ].y );
      const tail = _.tail( points );
      _.each( tail, function( element ) {
        self.lineTo( element.x, element.y );
      } );
      this.close();
    }
  }

  sceneryPhet.register( 'ArrowShape', ArrowShape );

  return inherit( Shape, ArrowShape, {}, {

    /**
     * This method is static so it can be used in ArrowShape as well as in ArrowNode.  If the tail and tip are at the
     * same location, there are no points and the arrow will not be shown.
     * @param {number} tailX
     * @param {number} tailY
     * @param {number} tipX
     * @param {number} tipY
     * @param {Vector2[]} shapePoints - if provided, values will be overwritten. This is to achieve
     *                                  high performance and is used by ArrowNode to avoid re-creating shapes.
     *                                  Tested this implementation vs the old one by creating hundreds of arrows and
     *                                  saw significant performance gains.
     * @param {Object} [options]
     * @returns {Vector2[]}
     * @static
     * @public
     */
    getArrowShapePoints: function( tailX, tailY, tipX, tipY, shapePoints, options ) {

      // default shapePoints to empty array if it isn't passed in
      if ( !shapePoints ) {
        shapePoints = [];
      }

      if ( tipX === tailX && tipY === tailY ) {

        // if arrow has no length, it should have no points so that we don't attempt to draw anything
        shapePoints.length = 0;
      }
      else {

        // create a vector representation of the arrow
        const vector = new Vector2( tipX - tailX, tipY - tailY );
        const length = vector.magnitude;

        // start with the dimensions specified in options
        let headWidth = options.headWidth;
        let headHeight = options.headHeight;
        let tailWidth = options.tailWidth;

        // handle scaling of the head and tail
        if ( options.isHeadDynamic ) {

          // scale down the head height, if it's dynamic
          if ( length < options.headHeight / options.fractionalHeadHeight ) {
            headHeight = length * options.fractionalHeadHeight;
            if ( options.scaleTailToo ) {

              // also scale down head width and tail width
              tailWidth = options.tailWidth * headHeight / options.headHeight;
              headWidth = options.headWidth * headHeight / options.headHeight;
            }
          }
        }
        else {

          // otherwise, just make sure that head height is less than arrow length
          headHeight = Math.min( options.headHeight, options.doubleHead ? 0.35 * length : 0.99 * length );
        }

        // Index into shapePoints, incremented each time addPoint is called.
        let index = 0;

        // Set up a coordinate frame that goes from the tail of the arrow to the tip.
        const xHatUnit = vector.normalized();
        const yHatUnit = xHatUnit.rotated( Math.PI / 2 );

        // Function to add a point to shapePoints
        const addPoint = function( xHat, yHat ) {
          const x = xHatUnit.x * xHat + yHatUnit.x * yHat + tailX;
          const y = xHatUnit.y * xHat + yHatUnit.y * yHat + tailY;
          if ( shapePoints[ index ] ) {
            shapePoints[ index ].x = x;
            shapePoints[ index ].y = y;
          }
          else {
            shapePoints.push( new Vector2( x, y ) );
          }
          index++;
        };

        // Compute points for single- or double-headed arrow
        if ( options.doubleHead ) {
          addPoint( 0, 0 );
          addPoint( headHeight, headWidth / 2 );
          addPoint( headHeight, tailWidth / 2 );
        }
        else {
          addPoint( 0, tailWidth / 2 );
        }
        addPoint( length - headHeight, tailWidth / 2 );
        addPoint( length - headHeight, headWidth / 2 );
        addPoint( length, 0 );
        addPoint( length - headHeight, -headWidth / 2 );
        addPoint( length - headHeight, -tailWidth / 2 );
        if ( options.doubleHead ) {
          addPoint( headHeight, -tailWidth / 2 );
          addPoint( headHeight, -headWidth / 2 );
        }
        else {
          addPoint( 0, -tailWidth / 2 );
        }

        if ( index < shapePoints.length ) {
          shapePoints.length = index;
        }
      }

      return shapePoints;
    }
  } );
} );
