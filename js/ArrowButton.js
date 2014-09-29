// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button with an arrow that points up, down, left or right.
 * Press and release immediately and the button fires on 'up'.
 * Press and hold for M milliseconds and the button will fire repeatedly every N milliseconds until released.
 *
 * @author Chris Malley (PixelZoom, Inc)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );
  var Timer = require( 'JOIST/Timer' );

  /**
   * @param {String} direction 'up'|'down'|'left'|'right'
   * @param callback
   * @param options
   * @constructor
   */
  function ArrowButton( direction, callback, options ) {

    var thisButton = this;

    var DEFAULT_ARROW_HEIGHT = 20;
    options = _.extend( {

        // options for the button
        baseColor: 'white',
        stroke: 'black',
        lineWidth: 1,
        cornerRadius: 4,
        xMargin: 7,
        yMargin: 5,

        // options for the arrow
        arrowHeight: DEFAULT_ARROW_HEIGHT, // from tip to base
        arrowWidth: DEFAULT_ARROW_HEIGHT * Math.sqrt( 3 ) / 2, // width of base
        arrowFill: 'black',
        arrowStroke: null,
        arrowLineWidth: 1,

        // options related to press-&-hold feature
        timerDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
        intervalDelay: 100 // fire continuously at this frequency (milliseconds)
      },
      options );

    // arrow node
    var arrowShape;
    if ( direction === 'up' ) {
      arrowShape = new Shape().moveTo( options.arrowHeight / 2, 0 ).lineTo( options.arrowHeight, options.arrowWidth ).lineTo( 0, options.arrowWidth ).close();
    }
    else if ( direction === 'down' ) {
      arrowShape = new Shape().moveTo( 0, 0 ).lineTo( options.arrowHeight, 0 ).lineTo( options.arrowHeight / 2, options.arrowWidth ).close();
    }
    else if ( direction === 'left' ) {
      arrowShape = new Shape().moveTo( 0, options.arrowHeight / 2 ).lineTo( options.arrowWidth, 0 ).lineTo( options.arrowWidth, options.arrowHeight ).close();
    }
    else if ( direction === 'right' ) {
      arrowShape = new Shape().moveTo( 0, 0 ).lineTo( options.arrowWidth, options.arrowHeight / 2 ).lineTo( 0, options.arrowHeight ).close();
    }
    else {
      throw new Error( "unsupported direction: " + direction );
    }
    options.content = new Path( arrowShape, {
      fill: options.arrowFill,
      stroke: options.arrowStroke,
      lineWidth: options.arrowLineWidth,
      pickable: false
    } );

    RectangularPushButton.call( thisButton, options );

    // touch area
    var dx = 0.25 * thisButton.width;
    var dy = 0.25 * thisButton.height;
    thisButton.touchArea = Shape.rectangle( -dx, -dy, thisButton.width + dx + dx, thisButton.height + dy + dy );

    // mouse area is constrained to the tight rectangle, so that we can make the children unpickable
    thisButton.mouseArea = Shape.rectangle( 0, 0, thisButton.width, thisButton.height );

    // interactivity
    thisButton.cursor = 'pointer';
    var enabled = true;
    var fired = false;
    var timeoutID = null;
    var intervalID = null;
    var cleanupTimer = function() {
      if ( timeoutID ) {
        Timer.clearTimeout( timeoutID );
        timeoutID = null;
      }
      if ( intervalID ) {
        Timer.clearInterval( intervalID );
        intervalID = null;
      }
    };
    thisButton.addInputListener( new ButtonListener( {

      down: function() {
        if ( timeoutID === null && intervalID === null ) {
          fired = false;
          timeoutID = Timer.setTimeout( function() {
            timeoutID = null;
            fired = true;
            intervalID = Timer.setInterval( function() {
              if ( enabled ) {
                callback();
              }
            }, options.intervalDelay );
          }, options.timerDelay );
        }
      },

      up: function() {
        cleanupTimer();
      },

      fire: function() {
        cleanupTimer();
        if ( !fired && enabled ) {
          callback();
        }
      }
    } ) );
  }

  return inherit( RectangularPushButton, ArrowButton );
} );
