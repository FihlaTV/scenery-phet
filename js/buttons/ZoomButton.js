// Copyright 2014-2020, University of Colorado Boulder

/**
 * Zoom button, has an icon with a magnifying glass, with either a plus or minus sign in the center of the glass.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const MinusNode = require( 'SCENERY_PHET/MinusNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const PlusNode = require( 'SCENERY_PHET/PlusNode' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function ZoomButton( options ) {

    options = merge( {
      in: true, // true: zoom-in button, false: zoom-out button
      radius: 15,
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      magnifyingGlassFill: 'white', // center of the glass
      magnifyingGlassStroke: 'black', // rim and handle
      tandem: Tandem.REQUIRED
    }, options );

    // the magnifying glass
    const glassLineWidth = 0.25 * options.radius;
    const glassNode = new Circle( options.radius, {
      fill: options.magnifyingGlassFill,
      stroke: options.magnifyingGlassStroke,
      lineWidth: glassLineWidth
    } );

    // handle at lower-left of glass, at a 45-degree angle
    const outsideRadius = options.radius + ( glassLineWidth / 2 ); // use outside radius so handle line cap doesn't appear inside glassNode
    const handleNode = new Line(
      outsideRadius * Math.cos( Math.PI / 4 ), outsideRadius * Math.sin( Math.PI / 4 ),
      options.radius * Math.cos( Math.PI / 4 ) + ( 0.65 * options.radius ), options.radius * Math.sin( Math.PI / 4 ) + ( 0.65 * options.radius ), {
        stroke: options.magnifyingGlassStroke,
        lineWidth: 0.4 * options.radius,
        lineCap: 'round'
      } );

    // plus or minus sign in middle of magnifying glass
    const signOptions = {
      size: new Dimension2( 1.3 * options.radius, options.radius / 3 ),
      centerX: glassNode.centerX,
      centerY: glassNode.centerY
    };
    const signNode = options.in ? new PlusNode( signOptions ) : new MinusNode( signOptions );

    options.content = new Node( { children: [ handleNode, glassNode, signNode ] } );

    RectangularPushButton.call( this, options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'ZoomButton', this );
  }

  sceneryPhet.register( 'ZoomButton', ZoomButton );

  return inherit( RectangularPushButton, ZoomButton );
} );
