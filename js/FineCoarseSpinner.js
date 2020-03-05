// Copyright 2019-2020, University of Colorado Boulder

/**
 * A type of spinner UI component that supports 'fine' and 'coarse' changes to a numeric value.
 *
 *   <  <<  [ value ]  >>  >
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import Node from '../../scenery/js/nodes/Node.js';
import ArrowButton from '../../sun/js/buttons/ArrowButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberDisplay from './NumberDisplay.js';
import sceneryPhet from './sceneryPhet.js';

class FineCoarseSpinner extends Node {

  /**
   * @param {NumberProperty} valueProperty
   * @param {Object} [options]
   */
  constructor( valueProperty, options ) {

    options = merge( {
      range: null, // {Range|null} if null, valueProperty.range must exist
      numberDisplayOptions: null, // {*|null} options propagated to the NumberDisplay subcomponent
      arrowButtonOptions: null, // {*|null} options propagated to all ArrowButton subcomponents
      deltaFine: 1, // {number} amount to increment/decrement when the 'fine' tweakers are pressed
      deltaCoarse: 10, // {number} amount to increment/decrement when the 'coarse' tweakers are pressed
      spacing: 10, // {number} horizontal space between subcomponents
      enabledProperty: null, // {BooleanProperty|null} is this control enabled?
      disabledOpacity: 0.5, // {number} opacity used to make the control look disabled
      tandem: Tandem.REQUIRED
    }, options );

    if ( !options.range ) {
      assert && assert( valueProperty.range, 'valueProperty.range or options.range must be provided' );
      options.range = valueProperty.range;
    }

    // So we know whether we can dispose of the enabledProperty and its tandem
    const ownsEnabledProperty = !options.enabledProperty;

    // Provide a default if not specified
    options.enabledProperty = options.enabledProperty || new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'enabledProperty' )
    } );

    assert && assert( options.deltaFine > 0, 'invalid deltaFine: ' + options.deltaFine );
    assert && assert( options.deltaCoarse > 0, 'invalid deltaCoarse: ' + options.deltaCoarse );
    assert && assert( !options.arrowButtonOptions || options.arrowButtonOptions.numberOfArrows === undefined,
      'FineCoarseSpinner sets arrowButtonOptions.numberOfArrows' );
    assert && assert( !options.arrowButtonOptions || options.arrowButtonOptions.tandem === undefined,
      'FineCoarseSpinner sets arrowButtonOptions.tandem' );
    assert && assert( !options.numberDisplayOptions || options.numberDisplayOptions.tandem === undefined,
      'FineCoarseSpinner sets numberDisplayOptions.tandem' );

    options.numberDisplayOptions = merge( {
      tandem: options.tandem.createTandem( 'numberDisplay' )
    }, options.numberDisplayOptions );

    // options for the 'fine' arrow buttons, which show 1 arrow
    const fineButtonOptions = merge( {
      numberOfArrows: 1,
      arrowWidth: 12, // width of base
      arrowHeight: 14, // from tip to base

      // pointer areas
      touchAreaXDilation: 3,
      touchAreaYDilation: 3,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0
    }, options.arrowButtonOptions );

    // options for the 'coarse' arrow buttons, which show 2 arrows
    const coarseButtonOptions = merge( {}, fineButtonOptions, {
      numberOfArrows: 2,
      arrowSpacing: -0.5 * fineButtonOptions.arrowHeight // arrows overlap
    } );

    // <
    const decrementFineButton = new ArrowButton( 'left', function() {
      valueProperty.value = valueProperty.value - options.deltaFine;
    }, merge( {}, fineButtonOptions, { tandem: options.tandem.createTandem( 'decrementFineButton' ) } ) );

    // <<
    const decrementCoarseButton = new ArrowButton( 'left', function() {
      const delta = Math.min( options.deltaCoarse, valueProperty.value - options.range.min );
      valueProperty.value = valueProperty.value - delta;
    }, merge( {}, coarseButtonOptions, { tandem: options.tandem.createTandem( 'decrementCoarseButton' ) } ) );

    // [ value ]
    const numberDisplay = new NumberDisplay( valueProperty, options.range, options.numberDisplayOptions );

    // >
    const incrementFineButton = new ArrowButton( 'right', function() {
      valueProperty.value = valueProperty.value + options.deltaFine;
    }, merge( {}, fineButtonOptions, { tandem: options.tandem.createTandem( 'incrementFineButton' ) } ) );

    // >>
    const incrementCoarseButton = new ArrowButton( 'right', function() {
      const delta = Math.min( options.deltaCoarse, options.range.max - valueProperty.value );
      valueProperty.value = valueProperty.value + delta;
    }, merge( {}, coarseButtonOptions, { tandem: options.tandem.createTandem( 'incrementCoarseButton' ) } ) );

    // <  <<  [ value ]  >>  >
    const layoutBox = new HBox( {
      spacing: options.spacing,
      children: [ decrementFineButton, decrementCoarseButton, numberDisplay, incrementCoarseButton, incrementFineButton ]
    } );

    // Wrap in Node to hide HBox API.
    assert && assert( !options.children, 'FineCoarseSpinner sets children' );
    options.children = [ layoutBox ];

    super( options );

    // @public
    this.enabledProperty = options.enabledProperty;
    const enabledObserver = enabled => {
      this.interruptSubtreeInput(); // interrupt interaction
      this.pickable = enabled;
      this.opacity = enabled ? 1.0 : options.disabledOpacity;
    };
    this.enabledProperty.link( enabledObserver );

    // Disable the buttons when the value is at min or max of the range
    const valuePropertyListener = value => {

      // left buttons
      decrementFineButton.enabled = decrementCoarseButton.enabled = ( value !== options.range.min );

      // right buttons
      incrementFineButton.enabled = incrementCoarseButton.enabled = ( value !== options.range.max );
    };
    valueProperty.link( valuePropertyListener ); // unlink required in dispose

    // @private
    this.disposeFineCoarseSpinner = () => {

      if ( valueProperty.hasListener( valuePropertyListener ) ) {
        valueProperty.unlink( valuePropertyListener );
      }

      if ( ownsEnabledProperty ) {
        this.enabledProperty.dispose();
      }
      else if ( this.enabledProperty.hasListener( enabledObserver ) ) {
        this.enabledProperty.unlink( enabledObserver );
      }

      // unregister tandems
      numberDisplay.dispose();
      decrementFineButton.dispose();
      decrementCoarseButton.dispose();
      incrementFineButton.dispose();
      incrementCoarseButton.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'FineCoarseSpinner', this );
  }

  // @public
  dispose() {
    this.disposeFineCoarseSpinner();
    super.dispose();
  }

  /**
   * Sets whether this Node is enabled or disabled.
   * @param {boolean} enabled
   * @public
   */
  setEnabled( enabled ) { this.enabledProperty.set( enabled ); }

  set enabled( value ) { this.setEnabled( value ); }

  /**
   * Gets whether this Node is enabled or disabled.
   * @returns {boolean}
   * @public
   */
  getEnabled() { return this.enabledProperty.get(); }

  get enabled() { return this.getEnabled(); }
}

sceneryPhet.register( 'FineCoarseSpinner', FineCoarseSpinner );
export default FineCoarseSpinner;