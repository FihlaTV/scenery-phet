// Copyright 2002-2013, University of Colorado Boulder

/**
 * The speedometer node is a scenery node view that shows the speed of the moving object(s).
 * Moved from GitHub/forces-and-motion-basics on 9/14/2013
 *
 * TODO: Move the string to this repo (instead of a constructor arg) once we have support for that.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var inherit = require( 'PHET_CORE/inherit' );
  var linear = require( 'DOT/Util' ).linear;
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  //Constants
  var ANGLE_PER_TICK = Math.PI * 2 / 4 / 8;
  var NUM_TICKS = ( 8 + 2 ) * 2 + 1;

  /**
   * Constructor
   * @param {Property} speedProperty Property<Number> for the velocity, which is converted to speed for the speedometer
   * @param {Object} options typical Node layout and display options
   * @param speedString {String} label to display (scaled to fit if necessary)
   * @param maxSpeed {Number} speed for the maximum tick mark
   * @constructor
   */
  function SpeedometerNode( speedProperty, speedString, maxSpeed, options ) {
    Node.call( this, _.extend( {}, options ) );
    var radius = 67;
    this.addChild( new Circle( radius, {fill: 'white', stroke: '#555555', lineWidth: 2} ) );

    var foregroundNode = new Node( { pickable: false } );
    this.addChild( foregroundNode );

    var needle = new Path( Shape.lineSegment( 0, 0, radius, 0 ), { stroke: 'red', lineWidth: 3} );
    foregroundNode.addChild( needle );

    this.label = new Text( speedString, {font: new PhetFont( 20 )} ).mutate( {centerX: 0, centerY: -radius / 3} );
    foregroundNode.addChild( this.label );

    var pin = new Circle( 2, {fill: 'black'} );
    foregroundNode.addChild( pin );

    var totalAngle = (NUM_TICKS - 1) * ANGLE_PER_TICK;
    var startAngle = -1 / 2 * Math.PI - totalAngle / 2;
    var endAngle = startAngle + totalAngle;

    //Update when the velocity changes
    speedProperty.link( function( speed ) {

      var needleAngle = linear( 0, maxSpeed, startAngle, endAngle, Math.abs( speed ) );
      needle.setMatrix( Matrix3.rotation2( needleAngle ) );
    } );

    //Add the tick marks
    for ( var i = 0; i < NUM_TICKS; i++ ) {
      var tickAngle = i * ANGLE_PER_TICK + startAngle;
      var tickLength = i % 2 === 0 ? 10 : 5;
      var lineWidth = i % 2 === 0 ? 2 : 1;
      var tick = new Path( Shape.lineSegment( (radius - tickLength) * Math.cos( tickAngle ), (radius - tickLength) * Math.sin( tickAngle ), radius * Math.cos( tickAngle ), radius * Math.sin( tickAngle ) ), { stroke: 'gray', lineWidth: lineWidth} );
      foregroundNode.addChild( tick );
    }
  }

  return inherit( Node, SpeedometerNode );
} );
