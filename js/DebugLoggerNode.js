// Copyright 2019, University of Colorado Boulder

/**
 * DebugLoggerNode is a node that can be placed in the view and can show debug log messages.  This is most often used
 * when a console is not available, such as when debugging on iPads or other tablets.
 *
 * Typically, an instance of this is created and made global for use on a given screen.  Example:
 *   phet.debugLoggerNode = new DebugLogger;
 *   this.addChild( phet.debugLoggerNode );
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const DEFAULT_NUM_LINES = 4;
  const DEFAULT_POSITION = new Vector2( 20, 20 );
  const DEFAULT_FONT = new PhetFont( 20 );
  const DEFAULT_TEXT_COLOR = Color.red;

  class DebugLoggerNode extends Node {

    /**
     * @param {Object} [options]
     * @constructor
     */
    constructor( options ) {

      options = _.extend( {

        left: DEFAULT_POSITION.x,
        top: DEFAULT_POSITION.y,
        numLines: DEFAULT_NUM_LINES,
        interLineSpacing: 5,

        // options for the text
        textOptions: {
          fill: DEFAULT_TEXT_COLOR,
          font: DEFAULT_FONT
        },

        // create this with a non-visible child so that positioning options can be used
        children: [
          new Rectangle( 0, 0, 1, 1, { fill: Color.TRANSPARENT } )
        ]
      }, options );

      super( options );

      // @private
      this.options = options;
      this.textNodes = [];
    }

    /**
     * log a message
     * @param {String} message
     */
    log( message ) {

      let messageTop = 0;
      if ( this.textNodes.length < this.options.numLines ) {

        // add this to the bottom of the existing set of lines
        if ( this.textNodes.length > 0 ) {
          messageTop = this.textNodes[ this.textNodes.length - 1 ].bottom;
        }
      }
      else {

        // delete the oldest line
        const lineToRemove = this.textNodes.shift();
        this.removeChild( lineToRemove );

        // move all the other lines up one
        this.textNodes[ 0 ].top = 0;
        for ( let i = 1; i < this.textNodes.length; i++ ) {
          this.textNodes[ i ].top = this.textNodes[ i - 1 ].bottom + this.options.interLineSpacing;
        }

        // set the top of the new node to be at the bottom of the last
        messageTop = this.textNodes[ this.textNodes.length - 1 ].bottom + this.options.interLineSpacing;
      }
      const messageNode = new Text( message, {
        font: this.options.textOptions.font,
        fill: this.options.textOptions.fill,
        left: 0,
        top: messageTop
      } );
      this.addChild( messageNode );
      this.textNodes.push( messageNode );
    }
  }

  return sceneryPhet.register( 'DebugLoggerNode', DebugLoggerNode );
} );
