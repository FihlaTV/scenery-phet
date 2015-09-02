// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the "Spring" screen, a demo of ParametricSpringNode.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SpringControls = require( 'SCENERY_PHET/demo/SpringControls' );
  var ParametricSpringNode = require( 'SCENERY_PHET/ParametricSpringNode' );
  var Range = require( 'DOT/Range' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @constructor
   */
  function SpringView() {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    // A 200-unit vertical "wall", for comparison with the spring size
    var wallNode = new Rectangle( 0, 0, 25, 200, {
      fill: 'rgb( 180, 180, 180 )',
      stroke: 'black',
      left: 20,
      centerY: 375
    } );

    // Ranges for the various properties of ParametricSpringNode
    var ranges = {
      loopsRange: new Range( 4, 15, 10 ),
      radiusRange: new Range( 5, 70, 10 ),
      aspectRatioRange: new Range( 0.5, 10, 4 ),
      pointsPerLoopRange: new Range( 10, 100, 30 ),
      lineWidthRange: new Range( 1, 10, 3 ),
      phaseRange: new Range( 0, 2 * Math.PI, Math.PI ), // radians
      deltaPhaseRange: new Range( 0, 2 * Math.PI, Math.PI / 2 ), // radians
      xScaleRange: new Range( 0.5, 11, 2.5 )
    };

    // spring
    var springNode = new ParametricSpringNode( {

      // initial values for Properties
      loops: ranges.loopsRange.defaultValue,
      radius: ranges.radiusRange.defaultValue,
      aspectRatio: ranges.aspectRatioRange.defaultValue,
      pointsPerLoop: ranges.pointsPerLoopRange.defaultValue,
      lineWidth: ranges.lineWidthRange.defaultValue,
      phase: ranges.phaseRange.defaultValue,
      deltaPhase: ranges.deltaPhaseRange.defaultValue,
      xScale: ranges.xScaleRange.defaultValue,

      // initial values for static fields
      frontColor: 'rgb( 150, 150, 255 )',
      middleColor: 'rgb( 0, 0, 255 )',
      backColor: 'rgb( 0, 0, 200 )',

      // use x,y exclusively for layout, because we're using boundsMethod:'none'
      x: wallNode.right,
      y: wallNode.centerY
    } );

    // control panel, scaled to fit
    var controls = new SpringControls( ranges, springNode );
    controls.setScaleMagnitude( Math.min( 1, this.layoutBounds.width / controls.width ) );
    controls.top = 0;
    controls.centerX = this.layoutBounds.centerX;

    this.addChild( controls );
    this.addChild( springNode );
    this.addChild( wallNode );

    // Reset All button, bottom right
    this.addChild( new ResetAllButton( {
      listener: function() {
        springNode.reset();
      },
      right: this.layoutBounds.maxX - 15,
      bottom: this.layoutBounds.maxY - 15
    } ) );
  }

  return inherit( ScreenView, SpringView );
} );