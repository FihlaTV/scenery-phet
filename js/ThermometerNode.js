// Copyright 2002-2014, University of Colorado Boulder

/**
 * Thermometer node, see https://github.com/phetsims/scenery-phet/issues/43
 *
 * @author Aaron Davis
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Shape = require( 'KITE/Shape' );
  var LinearFunction = require( 'DOT/LinearFunction' );

  // constants
  // center of the bulb is at (0,0), let the client code move to the correct position
  var BULB_CENTER_X = 0;
  var BULB_CENTER_Y = 0;

  /**
   * @param {number} minTemperature
   * @param {number} maxTemperature
   * @param {Property.<number>} temperatureProperty
   * @param {Object} [options]
   * @constructor
   */
  function ThermometerNode( minTemperature, maxTemperature, temperatureProperty, options ) {

    options = _.extend( {
      bulbDiameter: 50,
      tubeWidth: 30,
      tubeHeight: 100,
      lineWidth: 4,
      outlineStroke: 'black',
      tickSpacing: 15,
      majorTickLength: 15,
      minorTickLength: 7.5,
      //TODO issue #135 why do we need separate options for the bulb and tube? this looks strange, eg in Friction
      fluidBulbSpacing: 2, // space between the tube wall and the fluid inside it
      fluidTubeSpacing: 2, // space between the bulb wall and the fluid inside it

      // leave as null to have a transparent background. If a color is given, then an extra Rectangle is created for the background
      backgroundFill: null,

      // all the default colors are shades of red
      fluidMainColor: '#850e0e', // the main color of the bulb fluid, and the left side of the tube gradient
      fluidHighlightColor: '#ff7575', // the highlight color of the bulb fluid and the middle of the tube gradient
      fluidRightSideColor: '#c41515' // the right side of the tube gradient, not used currently
    }, options );

    Node.call( this );

    // Create a shaded sphere to act as the bulb fluid
    var bulbFluidDiameter = options.bulbDiameter - options.lineWidth - options.fluidBulbSpacing; //TODO should this be options.lineWidth/2 ?
    var bulbFluidNode = new ShadedSphereNode( bulbFluidDiameter, {
      centerX: BULB_CENTER_X,
      centerY: BULB_CENTER_Y,
      mainColor: options.fluidMainColor,
      highlightColor: options.fluidHighlightColor,
      highlightXOffset: -0.2,
      highlightYOffset: 0.2,
      rotation: Math.PI / 2
    } );

    // Angles for the outline of the bulb
    var bulbStartAngle = -Math.acos( options.tubeWidth / options.bulbDiameter );
    var bulbEndAngle = Math.PI - bulbStartAngle;

    //TODO issue #136 This is buggy. The height of the tube is not options.tubeHeight, the rounded top is being added to options.tubeHeight
    // Create the outline for the thermometer, starting with the bulb
    var tubeTopRadius = options.tubeWidth / 2;
    var straightTubeHeight = options.tubeHeight - tubeTopRadius;
    var straightTubeTop = BULB_CENTER_Y - ( straightTubeHeight + options.bulbDiameter / 2 );
    var outlineShape = new Shape()
      .arc( BULB_CENTER_X, BULB_CENTER_Y, options.bulbDiameter / 2, bulbStartAngle, bulbEndAngle )
      .verticalLineToRelative( -straightTubeHeight );
    var bulbUpperLeftCorner = outlineShape.getLastPoint();
    outlineShape.arc( BULB_CENTER_X, straightTubeTop, tubeTopRadius, Math.PI, 0 )
      .verticalLineToRelative( straightTubeHeight )
      .close();
    // tick marks
    outlineShape.moveToPoint( bulbUpperLeftCorner ).moveToRelative( options.majorTickLength ).horizontalLineToRelative( -options.majorTickLength );
    for ( var i = 0; i < Math.floor( straightTubeHeight / options.tickSpacing ); i++ ) {
      if ( i % 2 === 0 ) {
        outlineShape.moveToRelative( options.minorTickLength, options.tickSpacing ).horizontalLineToRelative( -options.minorTickLength );
      }
      else {
        outlineShape.moveToRelative( options.majorTickLength, options.tickSpacing ).horizontalLineToRelative( -options.majorTickLength );
      }
    }
    var outlineNode = new Path( outlineShape, {
      stroke: options.outlineStroke,
      lineWidth: options.lineWidth
    } );
    assert && assert( outlineNode.height === options.tubeHeight + options.bulbDiameter + options.lineWidth ); // see scenery-phet#136

    var tubeFluidWidth = options.tubeWidth - options.lineWidth - options.fluidTubeSpacing; //TODO should this be options.lineWidth/2 ?
    var clipBulbRadius = ( options.bulbDiameter - options.lineWidth - options.fluidBulbSpacing ) / 2; //TODO should this be options.lineWidth/2 ?
    var clipStartAngle = -Math.acos( ( tubeFluidWidth / 2 ) / clipBulbRadius );
    var clipEndAngle = Math.PI - clipStartAngle;
    var tubeFluidBottom = ( bulbFluidDiameter / 2 ) * Math.sin( clipEndAngle );
    var tubeFluidLeft = -tubeFluidWidth / 2;

    // Clip area for the fluid in the tube, round at the top
    var fluidClipShape = new Shape().moveTo( tubeFluidLeft, tubeFluidBottom )
      .verticalLineTo( straightTubeTop );
    fluidClipShape.arc( BULB_CENTER_X, straightTubeTop, tubeFluidWidth / 2, Math.PI, 0 )
      .lineTo( -tubeFluidLeft, tubeFluidBottom ).close();

    // Clip the top of the bulb so it's flat where it connects to the tube
    var bulbFluidClipArea = Shape.rectangle( tubeFluidBottom, -options.bulbDiameter / 2, options.bulbDiameter, options.bulbDiameter );
    bulbFluidNode.setClipArea( bulbFluidClipArea );

    // Gradient for fluid in tube
    var tubeFluidGradient = new LinearGradient( tubeFluidLeft, 0, tubeFluidLeft + tubeFluidWidth, 0 ).
      addColorStop( 0, options.fluidMainColor ).
      addColorStop( 0.4, options.fluidHighlightColor ).
      addColorStop( 0.5, options.fluidHighlightColor ).
      addColorStop( 1, options.fluidMainColor );

    // Fluid in the tube
    var tubeFluidNode = new Rectangle( 0, 0, tubeFluidWidth, 0, {
      fill: tubeFluidGradient,
      clipArea: fluidClipShape
    } );

    // Background inside the tube
    if ( options.backgroundFill ) {
      this.addChild( new Path( outlineShape, { fill: options.backgroundFill } ) );
    }

    // Add other nodes after optional background
    this.addChild( tubeFluidNode );
    this.addChild( bulbFluidNode );
    this.addChild( outlineNode );

    // Temperature determines the height of the fluid in the tube
    var height = new Path( fluidClipShape ).height;
    var maxFluidHeight = height - tubeFluidBottom;
    //TODO this can exceed max/min. should this be clamped? or should it be replaced by dot.Util.linear?
    var temperatureLinearFunction = new LinearFunction( minTemperature, maxTemperature, -tubeFluidBottom, maxFluidHeight );
    temperatureProperty.link( function( temp ) {
      var tubeFluidHeight = temperatureLinearFunction( temp );
      tubeFluidNode.setRect( tubeFluidLeft, -tubeFluidHeight, tubeFluidWidth, tubeFluidHeight );
    } );

    this.mutate( options );
  }

  return inherit( Node, ThermometerNode );
} );