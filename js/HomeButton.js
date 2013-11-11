// Copyright 2002-2013, University of Colorado Boulder

//TODO this should extend sun.Button
//TODO this should handle wiring up the callback that goes to the home screen, currently done in NavigationBar
/**
 * The Home button that appears in the navigation bar.
 */
define( function( require ) {
  'use strict';

  // imports
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var PushButton = require( 'SUN/PushButton' );
  var HighlightNode = require( 'JOIST/HighlightNode' );

  function HomeButton( fill, pressedFill, whiteColorScheme, options ) {

    var icon = function( fill, highlighted ) {
      var node = new FontAwesomeNode( 'home', { fill: fill, scale: 0.75 } );
      if ( highlighted ) {
        return new Node( {children: [node, new HighlightNode( node.width + 4, node.height, {center: node.center, whiteHighlight: !whiteColorScheme} )]} );
      }
      else {
        return node;
      }
    };
    PushButton.call( this, icon( fill, false ), icon( fill, true ), icon( pressedFill, true ), icon( fill, false ) );

    if ( options ) {
      this.mutate( options );
    }
    this.mouseArea = this.touchArea = Shape.rectangle( this.bounds.minX, this.bounds.minY, this.bounds.width, this.bounds.height );
  }

  return inherit( PushButton, HomeButton );
} );