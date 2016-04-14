// Copyright 2014-2015, University of Colorado Boulder

/**
 * Button used for stepping the simulation forward when paused.  Generated programmatically, as opposed to using a
 * raster image.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  // constants
  var DEFAULT_RADIUS = 20;

  /**
   * @param stepFunction
   * @param {Property.<boolean>} playingProperty - button will be disabled when this is true
   * @param {Object} [options]
   * @constructor
   */
  function StepButton( stepFunction, playingProperty, options ) {

    options = _.extend( {
      radius: DEFAULT_RADIUS,
      fireOnHold: true
    }, options );

    var stepButton = this;

    // step symbol is sized relative to the radius
    var barWidth = options.radius * 0.15;
    var barHeight = options.radius * 0.9;
    var triangleWidth = options.radius * 0.65;
    var triangleHeight = barHeight;

    var barPath = new Rectangle( 0, 0, barWidth, barHeight, { fill: 'black' } );
    var trianglePath = new Path( new Shape().moveTo( 0, triangleHeight / 2 ).lineTo( triangleWidth, 0 ).lineTo( 0, -triangleHeight / 2 ).close(), { fill: 'black' } );

    RoundPushButton.call( this, _.extend( {
      content: new HBox( { children: [ barPath, trianglePath ], spacing: barWidth } ),
      listener: stepFunction,
      radius: options.radius,

      //The icon is asymmetrical, and the layout looks off unless you shift it a little bit
      xContentOffset: options.radius * 0.075
    }, options ) );
    this.enabled = false;

    playingProperty.link( function( value ) { stepButton.enabled = !value; } );
  }

  sceneryPhet.register( 'StepButton', StepButton );

  return inherit( RoundPushButton, StepButton );
} );