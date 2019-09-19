// Copyright 2014-2019, University of Colorado Boulder

/**
 * A scenery node that is used to control which kit is selected in a kit
 * selection node.  This version is intended to add buttons at the left and
 * right sides of a kit (there's an alternate version that can be used at the
 * top of the kit).  It contains the back and forward buttons with a space
 * between them where the kit elements will appear.
 *
 * @author John Blanco
 */

define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Shape = require( 'KITE/Shape' );

  // constants
  const DEFAULT_BASE_COLOR = new Color( 'rgba( 109, 89, 205, 0.5 )' );

  /**
   * @param {number} numKits
   * @param {Property.<number>} selectedKitProperty - A property that tracks the selected kit as an integer
   * @param {number} spaceBetweenControls - Amount of horizontal space between the left and right control buttons
   * @param {Object} [options]
   * @constructor
   */
  function KitControlNodeSides( numKits, selectedKitProperty, spaceBetweenControls, options ) {
    Node.call( this );
    options = _.extend(
      {
        // Default values
        buttonBaseColor: DEFAULT_BASE_COLOR,
        buttonStroke: null,
        buttonLineWidth: 1,
        arrowStroke: 'white',
        arrowLineWidth: 4,
        arrowWidth: 12,
        arrowHeight: 40,
        xPadding: 5,
        yPadding: 5
      }, options );

    const commonButtonOptions = {
      stroke: options.buttonStroke,
      lineWidth: options.buttonLineWidth,
      baseColor: options.buttonBaseColor,
      disabledBaseColor: new Color( 180, 180, 180 ),
      cornerRadius: 4,
      xMargin: 5,
      yMargin: 3,
      buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy
    };

    // Create the icons that signify previous and next.
    const iconOptions = { stroke: options.arrowStroke, lineWidth: options.arrowLineWidth, lineCap: 'round' };
    const nextIcon = new Path( new Shape().moveTo( 0, 0 ).lineTo( options.arrowWidth, options.arrowHeight / 2 ).lineTo( 0, options.arrowHeight ), iconOptions );
    const previousIcon = new Path( new Shape().moveTo( options.arrowWidth, 0 ).lineTo( 0, options.arrowHeight / 2 ).lineTo( options.arrowWidth, options.arrowHeight ), iconOptions );

    const nextKitButton = new RectangularPushButton( _.extend( {
      content: nextIcon,
      baseColor: new Color( 'black' ),
      listener: function() {
        selectedKitProperty.value = selectedKitProperty.value + 1;
      }
    }, commonButtonOptions ) );
    this.addChild( nextKitButton );

    const previousKitButton = new RectangularPushButton( _.extend( {
      content: previousIcon,
      baseColor: 'orange',
      listener: function() {
        selectedKitProperty.value = selectedKitProperty.value - 1;
      }
    }, commonButtonOptions ) );
    this.addChild( previousKitButton );

    // Control button enabled state
    const selectedKitPropertyObserver = function( kitNum ) {
      nextKitButton.visible = ( kitNum < numKits - 1 );
      previousKitButton.visible = ( kitNum !== 0 );
    };
    selectedKitProperty.link( selectedKitPropertyObserver );

    // Layout
    nextKitButton.left = previousKitButton.right + spaceBetweenControls;

    this.mutate( options );

    // @private
    this.disposeKitControlNodeSides = function() {
      // TODO: buttons may still leak memory
      nextKitButton.dispose();
      previousKitButton.dispose();
      if ( selectedKitProperty.hasListener( selectedKitPropertyObserver ) ) {
        selectedKitProperty.unlink( selectedKitPropertyObserver );
      }
    };
  }

  sceneryPhet.register( 'KitControlNodeSides', KitControlNodeSides );

  return inherit( Node, KitControlNodeSides, {

    /**
     * Ensures that this node is subject to garbage collection
     * @public
     */
    dispose: function() {
      this.disposeKitControlNodeSides();
      Node.prototype.dispose.call( this );
    }
  } );
} );
