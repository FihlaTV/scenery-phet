// Copyright 2014-2019, University of Colorado Boulder

/**
 * Node for up/down buttons.  Used in the Fractions sims to increase/decrease numerator/denominator.  See also LeftRightSpinner.
 *
 * TODO: press to hold
 *
 * @author Sam Reid
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Shape = require( 'KITE/Shape' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   *
   * @param {Property.<number>} valueProperty
   * @param {Property.<boolean>} upEnabledProperty
   * @param {Property.<boolean>} downEnabledProperty
   * @param {Object} [options]
   * @constructor
   */
  function UpDownSpinner( valueProperty, upEnabledProperty, downEnabledProperty, options ) {
    const shapeWidth = 26;
    const upShape = new Shape().moveTo( 0, 0 ).lineTo( shapeWidth / 2, -10 ).lineTo( shapeWidth, 0 );
    const downShape = new Shape().moveTo( 0, 0 ).lineTo( shapeWidth / 2, 10 ).lineTo( shapeWidth, 0 );

    const upIcon = new Path( upShape, { lineWidth: 5, stroke: 'black', lineCap: 'round' } );
    const downIcon = new Path( downShape, { lineWidth: 5, stroke: 'black', lineCap: 'round' } );

    const radius = 20;
    const upButton = new RoundPushButton( {
      content: upIcon,
      listener: function() {
        valueProperty.set( valueProperty.get() + 1 );
      },
      radius: radius,
      touchAreaDilation: 5,
      baseColor: '#fefd53',
      yContentOffset: -3
    } );
    const upEnabledPropertyLinkAttribute = upEnabledProperty.linkAttribute( upButton, 'enabled' );

    const downButton = new RoundPushButton( {
      content: downIcon,
      listener: function() {
        valueProperty.set( valueProperty.get() - 1 );
      },
      radius: radius,
      touchAreaDilation: 5,
      baseColor: '#fefd53',
      yContentOffset: +3
    } );
    const downEnabledPropertyLinkAttribute = downEnabledProperty.linkAttribute( downButton, 'enabled' );

    VBox.call( this, { spacing: 6, children: [ upButton, downButton ] } );

    this.mutate( options );

    // @private
    this.disposeUpDownSpinner = function() {
      if ( upEnabledProperty.hasListener( upEnabledPropertyLinkAttribute) ) {
        upEnabledProperty.unlinkAttribute( upEnabledPropertyLinkAttribute );
      }
      if ( downEnabledProperty.hasListener( downEnabledPropertyLinkAttribute) ) {
        downEnabledProperty.unlinkAttribute( downEnabledPropertyLinkAttribute );
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'UpDownSpinner', this );
  }

  sceneryPhet.register( 'UpDownSpinner', UpDownSpinner );

  return inherit( VBox, UpDownSpinner, {

    /**
     * Ensures that this node is subject to garbage collection
     * @public
     */
    dispose: function() {
      this.disposeUpDownSpinner();
      VBox.prototype.dispose.call( this );
    }
  } );
} );