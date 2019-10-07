// Copyright 2015-2019, University of Colorado Boulder

/**
 * Visual representation of the effective E-field (E_effective) between the capacitor plates.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Emily Randall (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 *
 * Moved from capacitor-lab-basics/js/common/view/EFieldNode.js on Oct 7, 2019
 */
define( require => {
  'use strict';

  //modules
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  // constants
  const ARROW_SIZE = new Dimension2( 6, 7 );
  const LINE_WIDTH = 1;
  const ARROW_COLOR = 'black';

  // TODO: Enumeration for UP/DOWN?

  // determines spacing of electric field lines, chosen by inspection to match spacing from Java
  const SPACING_CONSTANT = 0.0258;

  /**
   * Draw one EField line with the provided parameters using HTML5 Canvas
   *
   * @param {Vector2} position - origin, at the center of the line
   * @param {number} length length of the line in view coordinates
   * @param {string} direction
   * @param {CanvasRenderingContext2D} context
   */
  function drawEFieldLine( position, length, direction, context ) {

    // line, origin at center
    context.moveTo( position.x, position.y - length / 2 - 3 );
    context.lineTo( position.x, position.y + length / 2 - 3 );

    // pull out for readability
    const w = ARROW_SIZE.width;
    const h = ARROW_SIZE.height;

    // make sure that the arrow path is centered along the field line.
    // dividing by 4 aligns better than dividing by 2 for the narrow line width.
    const xOffset = LINE_WIDTH / 4;
    const arrowCenter = ( direction === 'UP' ) ? position.x - xOffset : position.x + xOffset;

    // path for the UP arrow
    if ( direction === 'UP' ) {
      context.moveTo( arrowCenter, position.y - h / 2 );
      context.lineTo( arrowCenter + w / 2, position.y + h / 2 );
      context.lineTo( arrowCenter - w / 2, position.y + h / 2 );
    }

    // path for the DOWN arrow
    else if ( direction === 'DOWN' ) {
      context.moveTo( arrowCenter, position.y + h / 2 );
      context.lineTo( arrowCenter - w / 2, position.y - h / 2 );
      context.lineTo( arrowCenter + w / 2, position.y - h / 2 );
    }

    else {
      assert && assert( false, 'EFieldLine must be of orientation UP or DOWN' );
    }
  }

  /**
   * @constructor
   *
   * @param {Capacitor} capacitor
   * @param {CLBModelViewTransform3D} modelViewTransform
   * @param {number} maxEffectiveEField
   * @param {Bounds2} canvasBounds
   */
  function EFieldNode( capacitor, modelViewTransform, maxEffectiveEField, canvasBounds ) {

    CanvasNode.call( this, {
      canvasBounds: canvasBounds
    } );
    const self = this;

    // @private
    this.capacitor = capacitor;
    this.modelViewTransform = modelViewTransform;
    this.maxEffectiveEField = maxEffectiveEField;

    Property.multilink( [
      capacitor.plateSizeProperty,
      capacitor.plateSeparationProperty,
      capacitor.plateVoltageProperty
    ], function() {
      if ( self.isVisible() ) {
        self.invalidatePaint();
      }
    } );
  }

  sceneryPhet.register( 'EFieldNode', EFieldNode );

  return inherit( CanvasNode, EFieldNode, {

    /**
     * Update the node when it becomes visible.  Overrides setVisible in Node.
     * @public
     * @override
     */
    setVisible: function( visible ) {
      Node.prototype.setVisible.call( this, visible );
      if ( visible ) {
        this.invalidatePaint();
      }
    },

    /**
     * Rendering function
     * @public
     *
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {

      // compute density (spacing) of field lines
      const effectiveEField = this.capacitor.getEffectiveEField();
      const lineSpacing = this.getLineSpacing( effectiveEField );

      if ( lineSpacing > 0 ) {

        context.beginPath();

        // relevant model values
        const plateWidth = this.capacitor.plateSizeProperty.value.width;
        const plateDepth = plateWidth;
        const plateSeparation = this.capacitor.plateSeparationProperty.value;

        /*
         * Create field lines, working from the center outwards so that lines appear/disappear at edges of plate as
         * E_effective changes.
         */
        const length = this.modelViewTransform.modelToViewDeltaXYZ( 0, plateSeparation, 0 ).y;
        const direction = ( effectiveEField >= 0 ) ? 'DOWN' : 'UP';
        let x = lineSpacing / 2;
        while ( x <= plateWidth / 2 ) {
          let z = lineSpacing / 2;
          while ( z <= plateDepth / 2 ) {

            // calculate position for the lines
            const y = 0;
            const line0Translation = this.modelViewTransform.modelToViewXYZ( x, y, z );
            const line1Translation = this.modelViewTransform.modelToViewXYZ( -x, y, z );
            const line2Translation = this.modelViewTransform.modelToViewXYZ( x, y, -z );
            const line3Translation = this.modelViewTransform.modelToViewXYZ( -x, y, -z );

            // add 4 lines, one for each quadrant
            drawEFieldLine( line0Translation, length, direction, context );
            drawEFieldLine( line1Translation, length, direction, context );
            drawEFieldLine( line2Translation, length, direction, context );
            drawEFieldLine( line3Translation, length, direction, context );

            z += lineSpacing;
          }
          x += lineSpacing;
        }
        // stroke the whole path
        context.strokeStyle = ARROW_COLOR;
        context.fillStyle = ARROW_COLOR;
        context.lineWidth = LINE_WIDTH;
        context.fill();
        context.stroke();
      }
    },

    /**
     * Gets the spacing of E-field lines. Higher E-field results in higher density,
     * therefore lower spacing. Density is computed for the minimum plate size.
     * @public
     *
     * @param {number} effectiveEField
     * @returns {number} spacing, in model coordinates
     */
    getLineSpacing: function( effectiveEField ) {
      if ( effectiveEField === 0 ) {
        return 0;
      }
      else {
        // sqrt looks best for a square plate
        return SPACING_CONSTANT / Math.sqrt( Math.abs( effectiveEField ) );
      }
    }

  } );
} );