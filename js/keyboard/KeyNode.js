// Copyright 2017, University of Colorado Boulder

/**
 * A node that looks like a keyboard key.  Has a shadow rectangle under the key icon with a slight offset so that it
 * has a 3D appearance.  KeyNodes are primarily used for accessibility to provide extra information about keyboard
 * navigation and functionality, but an icon could be used for any purpose.
 *
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var AlignBox = require( 'SCENERY/nodes/AlignBox' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  // constants
  // default options for the KeyNode, all widths, offsets, and height values are in the ScreenView coordinate frame
  var DEFAULT_OPTIONS = {

    // color and styling
    keyFill: 'white',
    keyShadowFill: 'black',
    lineWidth: 1, // line width for the key icon
    cornerRadius: 2, // corner radius applied to the key and its shadow

    // offset for the shadow rectangle relative to the top left corner of the key
    xShadowOffset: 2,
    yShadowOffset: 2,

    // margins
    xMargin: 0, // sets the horizontal margin for the icon from the left/right edge
    yMargin: 0, // set the vertical margin for the icon from the top/botton edges

    // icon aligned in center of key by default
    xAlign: 'center', // {string} 'left', 'center', or 'right'
    yAlign: 'center', // {string} 'top', 'center', or 'bottom'

    // key will be at least this wide, making it possible to surround the icon with extra space if necessary
    minKeyWidth: 25,

    // TODO: this should not be an option. All keys must be this height!
    maxKeyHeight: 25
  };

  /**
   * Constructor.
   * @param {Node} keyIcon - icon placed in the key
   * @param {Object} options
   */
  function KeyNode( keyIcon, options ) {

    options = _.extend( {}, DEFAULT_OPTIONS, options );
    assert && assert( !options.children, 'KeyNode cannot have additional children' );

    var minKeyWidth = Math.max( options.minKeyWidth, keyIcon.width );
    var maxKeyHeight = options.maxKeyHeight;

    // scale down the size of the keyIcon passed in if it is taller than the max heigh of the icon
    var scalar = 1;
    if ( keyIcon.height > options.maxKeyHeight ) {
      scalar = 1 / keyIcon.height / options.maxKeyHeight;
    }
    // Add the scale to a new node, with keyIcon as a child so that we don't mutate the parameter node.
    var scaleNode = new Node( { children: [ keyIcon ], scale: scalar } );

    // place content in an align box so that the key surrounding the icon has minimum bounds calculated above
    // with support for margins
    var content = new AlignBox( scaleNode, {
      alignBounds: new Bounds2( 0, 0, minKeyWidth, maxKeyHeight ),
      xAlign: options.xAlign,
      yAlign: options.yAlign,
      xMargin: options.xMargin,
      yMargin: options.yMargin
    } );

    // children of the icon node, including the background shadow, foreground key, and content icon
    options.children = [

      // background (shadow rectangle)
      Rectangle.roundedBounds( content.bounds.shifted(
        options.xShadowOffset, options.yShadowOffset ), options.cornerRadius, options.cornerRadius, {
        fill: options.keyShadowFill
      } ),

      // foreground
      Rectangle.roundedBounds( content.bounds, options.cornerRadius, options.cornerRadius, {
        fill: options.keyFill,
        stroke: 'black',
        lineWidth: options.lineWidth
      } ),

      // content on top
      content
    ];

    Node.call( this, options );
  }
  sceneryPhet.register( 'KeyNode', KeyNode );

  return inherit( Node, KeyNode );
} );
