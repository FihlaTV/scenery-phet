// Copyright 2014-2019, University of Colorado Boulder

/**
 * Eye dropper, with a button for dispensing whatever is in the dropper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const RoundMomentaryButton = require( 'SUN/buttons/RoundMomentaryButton' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Shape = require( 'KITE/Shape' );
  const Tandem = require( 'TANDEM/Tandem' );

  // images
  const backgroundImage = require( 'image!SCENERY_PHET/eye_dropper_background.png' );
  const foregroundImage = require( 'image!SCENERY_PHET/eye_dropper_foreground.png' );

  // constants
  const DEBUG_ORIGIN = false; // if true, put a red dot at the dropper's origin (bottom center)

  // constants specific to the image files
  const TIP_WIDTH = 15;
  const TIP_HEIGHT = 4;
  const GLASS_WIDTH = 46;
  const GLASS_MAX_Y = -18; // relative to bottom center
  const GLASS_MIN_Y = -124; // relative to bottom center
  const BUTTON_CENTER_Y_OFFSET = 32; // y-offset of button's center in dropper image file

  /**
   * @param {Object} [options]
   * @constructor
   */
  function EyeDropperNode( options ) {

    options = _.extend( {
      cursor: 'pointer',
      dispensingProperty: new Property( false ), // is the dropper dispensing?
      enabledProperty: new Property( true ), // is the button enabled?
      emptyProperty: new Property( false ), // does the dropper appear to be empty?
      buttonTouchAreaDilation: 15, // dilation of the button's radius for touchArea
      fluidColor: 'yellow', // {Color|String} color of the fluid in the glass

      // Note: EyeDropperNode is not draggable and hence only registers its button with tandem.
      tandem: Tandem.required
    }, options );

    var self = this;

    // @public
    this.dispensingProperty = options.dispensingProperty;
    this.enabledProperty = options.enabledProperty;
    this.emptyProperty = options.emptyProperty;

    // @private fluid fills the glass portion of the dropper, shape is specific to the dropper image file
    this.fluidNode = new Path( new Shape()
      .moveTo( -TIP_WIDTH / 2, 0 )
      .lineTo( -TIP_WIDTH / 2, -TIP_HEIGHT )
      .lineTo( -GLASS_WIDTH / 2, GLASS_MAX_Y )
      .lineTo( -GLASS_WIDTH / 2, GLASS_MIN_Y )
      .lineTo( GLASS_WIDTH / 2, GLASS_MIN_Y )
      .lineTo( GLASS_WIDTH / 2, GLASS_MAX_Y )
      .lineTo( TIP_WIDTH / 2, -TIP_HEIGHT )
      .lineTo( TIP_WIDTH / 2, 0 )
      .close(), {
      fill: options.fluidColor
    } );

    // images, origin moved to bottom center
    var foreground = new Image( foregroundImage );
    var background = new Image( backgroundImage );
    foreground.x = -foreground.width / 2;
    foreground.y = -foreground.height;
    background.x = -background.width / 2;
    background.y = -background.height;

    // button, centered in the dropper's bulb
    var button = new RoundMomentaryButton( false, true, this.dispensingProperty, {
      baseColor: 'red',
      radius: 18,
      listenerOptions: {
        // We want to be able to drag the dropper WHILE dispensing, see https://github.com/phetsims/ph-scale/issues/86
        attach: false
      },
      tandem: options.tandem.createTandem( 'button' )
    } );
    var enabledObserver = function( enabled ) { button.enabled = enabled; };
    this.enabledProperty.link( enabledObserver );
    button.touchArea = Shape.circle( 0, 0, ( button.width / 2 ) + options.buttonTouchAreaDilation );
    button.centerX = foreground.centerX;
    button.centerY = foreground.top + BUTTON_CENTER_Y_OFFSET;

    // make the background visible only when the dropper is empty
    var emptyObserver = function( empty ) {
      self.fluidNode.visible = !empty;
      background.visible = empty;
    };
    this.emptyProperty.link( emptyObserver );

    options.children = [ this.fluidNode, background, foreground, button ];

    // add a red dot at the origin
    if ( DEBUG_ORIGIN ) {
      options.children.push( new Circle( { radius: 3, fill: 'red' } ) );
    }

    Node.call( this, options );

    // @private
    this.disposeEyeDropperNode = function() {
      button.dispose();
      self.enabledProperty.unlink( enabledObserver );
      self.emptyProperty.unlink( emptyObserver );
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'EyeDropperNode', this );
  }

  sceneryPhet.register( 'EyeDropperNode', EyeDropperNode );

  return inherit( Node, EyeDropperNode, {

    // @public makes this instance eligible for garbage collection
    dispose: function() {
      this.disposeEyeDropperNode();
      Node.prototype.dispose.call( this );
    },

    set dispensing( value ) { this.dispensingProperty = value; },

    get dispensing() { return this.dispensingProperty.value; },

    set enabled( value ) { this.enabledProperty = value; },

    get enabled() { return this.enabledProperty.value; },

    set empty( value ) { this.emptyProperty = value; },

    get empty() { return this.emptyProperty.value; },

    set fluidColor( value ) { this.fluidNode.fill = value; },

    get fluidColor() { return this.fluidNode.fill; }

  }, {

    // @static
    // You'll need these if you want to create fluid coming out of the tip, or put a label on the glass.
    TIP_WIDTH: TIP_WIDTH,
    TIP_HEIGHT: TIP_HEIGHT,
    GLASS_WIDTH: GLASS_WIDTH,
    GLASS_MIN_Y: GLASS_MIN_Y,
    GLASS_MAX_Y: GLASS_MAX_Y
  } );
} );
