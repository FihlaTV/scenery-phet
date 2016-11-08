// Copyright 2015, University of Colorado Boulder

/**
 * Light bulb, made to 'glow' by modulating opacity of the 'on' image.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Util = require( 'DOT/Util' );
  var LightRaysNode = require( 'SCENERY_PHET/LightRaysNode' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var Rectangle = require( 'DOT/Rectangle' );

  // images
  var onImage = require( 'mipmap!SCENERY_PHET/light-bulb-on.png' );
  var offImage = require( 'mipmap!SCENERY_PHET/light-bulb-off.png' );

  /**
   * @param {Property.<number>} brightnessProperty 0 (off) to 1 (full brightness)
   * @param {Object} [options]
   * @constructor
   */
  function LightBulbNode( brightnessProperty, options ) {

    var defaultOptions = {
      bulbImageScale: 0.33,
      rayStroke: 'yellow',
      minRays: 8,
      maxRays: 60,
      minRayLength: 0,
      maxRayLength: 200,
      longRayLineWidth: 1.5, // for long rays
      mediumRayLineWidth: 1, // for medium-length rays
      shortRayLineWidth: 0.5 // for short rays
    };

    options = _.extend( {}, defaultOptions, options ); // don't modify defaultOptions!

    // @private
    this.onNode = new Image( onImage, {
      scale: options.bulbImageScale,
      centerX: 0,
      bottom: 0
    } ); // @private

    var offNode = new Image( offImage, {
      scale: options.bulbImageScale,
      centerX: this.onNode.centerX,
      bottom: this.onNode.bottom
    } );

    // rays
    var bulbRadius = offNode.width / 2; // use 'off' node, the 'on' node is wider because it has a glow around it.
    var rayOptions = _.pick( options, _.keys( defaultOptions ) ); // cherry-pick options that are specific to rays
    rayOptions.x = this.onNode.centerX;
    rayOptions.y = offNode.top + bulbRadius;
    this.raysNode = new LightRaysNode( bulbRadius, rayOptions ); // @private

    options.children = [ this.raysNode, offNode, this.onNode ];
    Node.call( this, options );

    var brightnessObserver = function() { this.update(); }; // @private
    this.brightnessProperty = brightnessProperty; // @private
    this.brightnessProperty.link( this.brightnessObserver );

    // this.mouseArea = new Rectangle( 0, 0, 100, 100 );
    // this.touchArea = new Rectangle( 200, 200, 300, 400 );

    // @private
    this.disposeLightBulbNode = function() {
      brightnessProperty.unlink( brightnessObserver );
    };
  }

  sceneryPhet.register( 'LightBulbNode', LightBulbNode );

  inherit( Node, LightBulbNode, {

    // @public Ensures that this object is eligible for GC
    dispose: function() {
      this.disposeLightBulbNode();
    },

    // @private
    update: function() {
      if ( this.visible ) {
        var brightness = this.brightnessProperty.value;
        assert && assert( brightness >= 0 && brightness <= 1 );
        this.onNode.visible = ( brightness > 0 );
        if ( this.onNode.visible ) {
          this.onNode.opacity = Util.linear( 0, 1, 0.3, 1, brightness );
        }
        this.raysNode.setBrightness( brightness );
      }
    },

    // @override update when this node becomes visible
    setVisible: function( visible ) {
      var wasVisible = this.visible;
      Node.prototype.setVisible.call( this, visible );
      if ( !wasVisible && visible ) {
        this.update();
      }
    }
  } );

  return LightBulbNode;
} );