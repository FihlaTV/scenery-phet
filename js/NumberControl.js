// Copyright 2015-2019, University of Colorado Boulder

/**
 * Control for changing a Property of type {number}.
 * Consists of a labeled value, slider and arrow buttons.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessibleSlider = require( 'SUN/accessibility/AccessibleSlider' );
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const ArrowButton = require( 'SUN/buttons/ArrowButton' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HSlider = require( 'SUN/HSlider' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberControlIO = require( 'SCENERY_PHET/NumberControlIO' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  const PaintColorProperty = require( 'SCENERY/util/PaintColorProperty' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const SliderIO = require( 'SUN/SliderIO' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  const SPECIFIC_COMPONENT_CALLBACK_OPTIONS = [
    'startDrag',
    'endDrag',
    'leftStart',
    'leftEnd',
    'rightStart',
    'rightEnd'
  ];
  const POINTER_AREA_OPTION_NAMES = [ 'touchAreaXDilation', 'touchAreaYDilation', 'mouseAreaXDilation', 'mouseAreaYDilation' ];

  /**
   * @param {string} title
   * @param {Property.<number>} numberProperty
   * @param {Range} numberRange
   * @param {Object} [options] - subcomponent objects: sliderOptions, numberDisplayOptions, arrowButtonOptions, titleNodeOptions
   * @mixes AccessibleSlider
   * @constructor
   */
  function NumberControl( title, numberProperty, numberRange, options ) {
    options = _.extend( {

      // General Callbacks
      startCallback: null, // called when interaction begins, default value set in validateCallbacksAndSetDefault()
      endCallback: null, // called when interaction ends, default value set in validateCallbacksAndSetDefault()
      delta: 1,

      enabledProperty: new Property( true ), // {Property.<boolean>} is this control enabled?
      disabledOpacity: 0.5, // {number} opacity used to make the control look disabled

      // A {function} that handles layout of subcomponents.
      // It has signature function( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton )
      // and returns a Node. If you want to customize the layout, use one of the predefined creators
      // (see createLayoutFunction*) or create your own function.
      layoutFunction: NumberControl.createLayoutFunction1(),

      // {*|null} options propagated to ArrowButton
      arrowButtonOptions: null,

      // {*|null} options propagated to HSlider
      sliderOptions: null,

      // {*|null} options propagated to NumberDisplay
      numberDisplayOptions: null,

      // {*|null} options propagated to the title Text node
      titleNodeOptions: null,

      // phet-io
      tandem: Tandem.required,
      phetioType: NumberControlIO,

      // a11y
      groupFocusHighlight: true
    }, options );

    // validate options
    assert && assert( !options.startDrag, 'use options.startCallback instead of options.startDrag' );
    assert && assert( !options.endDrag, 'use options.endCallback instead of options.endDrag' );
    assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1,
      `invalid disabledOpacity: ${options.disabledOpacity}` );
    assert && assert( !options.shiftKeyboardStep, 'shift keyboard stop handled by arrow buttons, do not use with NumberControl' );
    assert && assert( !options.shiftKeyboardStep, 'shift keyboard stop handled by arrow buttons, do not use with NumberControl' );
    assert && assert( options.isAccessible === undefined, 'NumberControl sets isAccessible for Slider' );

    // Make sure that general callbacks (for all components) and specific callbacks (for a specific component) aren't
    // used in tandem.
    validateCallbacksAndSetDefault( options );

    // Defaults for ArrowButton
    let arrowButtonOptions = _.extend( {
      scale: 0.85,

      // Values chosen to match previous behavior, see https://github.com/phetsims/scenery-phet/issues/489.
      // touchAreaXDilation is 1/2 of its original value because touchArea is shifted.
      touchAreaXDilation: 3.5,
      touchAreaYDilation: 7,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // callbacks
      leftStart: options.startCallback, // called when left arrow is pressed
      leftEnd: options.endCallback, // called when left arrow is released
      rightStart: options.startCallback, // called when right arrow is pressed
      rightEnd: options.endCallback // called when right arrow is released
    }, options.arrowButtonOptions );

    // Arrow button pointer areas need to be asymmetrical, see https://github.com/phetsims/scenery-phet/issues/489.
    // Get the pointer area options related to ArrowButton so that we can handle pointer areas here.
    // And do not propagate those options to ArrowButton instances.
    const arrowButtonPointerAreaOptions = _.pick( arrowButtonOptions, POINTER_AREA_OPTION_NAMES );
    arrowButtonOptions = _.omit( arrowButtonOptions, POINTER_AREA_OPTION_NAMES );

    // a11y - for alternative input, the number control is accessed entirely through slider interaction and these
    // arrow buttons are not tab navigable
    assert && assert( arrowButtonOptions.tagName === undefined,
      'NumberControl handles alternative input for arrow buttons' );
    arrowButtonOptions.tagName = null;

    // Defaults for HSlider
    let sliderOptions = _.extend( {

      startDrag: options.startCallback, // called when dragging starts on the slider
      endDrag: options.endCallback, // called when dragging ends on the slider

      // With the exception of startDrag and endDrag (use startCallback and endCallback respectively),
      // all HSlider options may be used. These are the ones that NumberControl overrides:
      majorTickLength: 20,
      minorTickStroke: 'rgba( 0, 0, 0, 0.3 )',

      // other slider options that are specific to NumberControl
      majorTicks: [], // array of objects with these fields: { value: {number}, label: {Node} }
      minorTickSpacing: 0, // zero indicates no minor ticks

      // phet-io
      tandem: options.tandem.createTandem( 'slider' )
    }, options.sliderOptions );

    // Slider options for track (if not specified as trackNode)
    if ( !options.sliderOptions.trackNode ) {
      sliderOptions = _.extend( {
        trackSize: new Dimension2( 180, 3 )
      }, sliderOptions );
    }

    // Slider options for thumb (if not specified as thumbNode)
    if ( !options.sliderOptions.thumbNode ) {
      sliderOptions = _.extend( {
        thumbSize: new Dimension2( 17, 34 ),
        thumbTouchAreaXDilation: 6
      }, sliderOptions );
    }

    // Defaults for NumberDisplay
    const numberDisplayOptions = _.extend( {
      // value
      font: new PhetFont( 12 ),
      maxWidth: null, // {null|number} maxWidth to use for value display, to constrain width for i18n

      // phet-io
      tandem: options.tandem.createTandem( 'numberDisplay' )
    }, options.numberDisplayOptions );

    const titleNodeOptions = _.extend( {
      font: new PhetFont( 12 ),
      maxWidth: null, // {null|string} maxWidth to use for title, to constrain width for i18n
      fill: 'black',
      tandem: options.tandem.createTandem( 'titleNode' )
    }, options.titleNodeOptions );

    // highlight color for thumb defaults to a brighter version of the thumb color
    if ( sliderOptions.thumbFill && !sliderOptions.thumbFillHighlighted ) {
      // @private {Property.<Color>}
      this.thumbFillProperty = new PaintColorProperty( sliderOptions.thumbFill );

      // Reference to the DerivedProperty not needed, since we dispose what it listens to above.
      sliderOptions.thumbFillHighlighted = new DerivedProperty( [ this.thumbFillProperty ], color => color.brighterColor() );
    }
    // constrain the slider value to the provided range and the same delta as the arrow buttons
    sliderOptions.constrainValue = sliderOptions.constrainValue || ( value => {
      const newValue = Util.roundToInterval( value, options.delta ); // constrain to multiples of delta, see #384
      return numberRange.constrainValue( newValue );
    } );

    const titleNode = new Text( title, titleNodeOptions );

    const numberDisplay = new NumberDisplay( numberProperty, numberRange, numberDisplayOptions );

    const leftArrowButton = new ArrowButton( 'left', () => {
      let value = numberProperty.get() - options.delta;
      value = Util.roundToInterval( value, options.delta ); // constrain to multiples of delta, see #384
      value = Math.max( value, numberRange.min ); // constrain to range
      numberProperty.set( value );
    }, _.extend( {
      startCallback: arrowButtonOptions.leftStart,
      endCallback: arrowButtonOptions.leftEnd,
      tandem: options.tandem.createTandem( 'leftArrowButton' )
    }, arrowButtonOptions ) );

    const rightArrowButton = new ArrowButton( 'right', () => {
      let value = numberProperty.get() + options.delta;
      value = Util.roundToInterval( value, options.delta ); // constrain to multiples of delta, see #384
      value = Math.min( value, numberRange.max ); // constrain to range
      numberProperty.set( value );
    }, _.extend( {
      startCallback: arrowButtonOptions.rightStart,
      endCallback: arrowButtonOptions.rightEnd,
      tandem: options.tandem.createTandem( 'rightArrowButton' )
    }, arrowButtonOptions ) );

    // arrow button touchAreas, asymmetrical, see https://github.com/phetsims/scenery-phet/issues/489
    leftArrowButton.touchArea = leftArrowButton.localBounds
      .dilatedXY( arrowButtonPointerAreaOptions.touchAreaXDilation, arrowButtonPointerAreaOptions.touchAreaYDilation )
      .shiftedX( -arrowButtonPointerAreaOptions.touchAreaXDilation );
    rightArrowButton.touchArea = rightArrowButton.localBounds
      .dilatedXY( arrowButtonPointerAreaOptions.touchAreaXDilation, arrowButtonPointerAreaOptions.touchAreaYDilation )
      .shiftedX( arrowButtonPointerAreaOptions.touchAreaXDilation );

    // arrow button mouseAreas, asymmetrical, see https://github.com/phetsims/scenery-phet/issues/489
    leftArrowButton.mouseArea = leftArrowButton.localBounds
      .dilatedXY( arrowButtonPointerAreaOptions.mouseAreaXDilation, arrowButtonPointerAreaOptions.mouseAreaYDilation )
      .shiftedX( -arrowButtonPointerAreaOptions.mouseAreaXDilation );
    rightArrowButton.mouseArea = rightArrowButton.localBounds
      .dilatedXY( arrowButtonPointerAreaOptions.mouseAreaXDilation, arrowButtonPointerAreaOptions.mouseAreaYDilation )
      .shiftedX( arrowButtonPointerAreaOptions.mouseAreaXDilation );

    const arrowEnabledListener = value => {
      leftArrowButton.enabled = ( value > numberRange.min );
      rightArrowButton.enabled = ( value < numberRange.max );
    };
    numberProperty.link( arrowEnabledListener );

    // NumberControl uses the AccessibleSlider trait, so don't include any accessibility on the slider
    sliderOptions.isAccessible = false;

    // a11y - shiftKeyboardStep is handled by clicking the arrow buttons
    sliderOptions.shiftKeyboardStep = 0;

    // Make sure Slider gets created with the right IO Type
    sliderOptions.phetioType = SliderIO;

    const slider = new HSlider( numberProperty, numberRange, sliderOptions );

    // major ticks
    const majorTicks = sliderOptions.majorTicks;
    for ( let i = 0; i < majorTicks.length; i++ ) {
      slider.addMajorTick( majorTicks[ i ].value, majorTicks[ i ].label );
    }

    // minor ticks, exclude values where we already have major ticks
    if ( sliderOptions.minorTickSpacing > 0 ) {
      for ( let minorTickValue = numberRange.min; minorTickValue <= numberRange.max; ) {
        if ( !_.find( majorTicks, majorTick => majorTick.value === minorTickValue ) ) {
          slider.addMinorTick( minorTickValue );
        }
        minorTickValue += sliderOptions.minorTickSpacing;
      }
    }

    options.children = [
      options.layoutFunction( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton )
    ];
    Node.call( this, options );

    // a11y - the number control acts like a range input for a11y, pass slider options without tandem
    const accessibleSliderOptions = _.omit( sliderOptions, [ 'tandem' ] );
    this.initializeAccessibleSlider( numberProperty, slider.enabledRangeProperty, slider.enabledProperty, accessibleSliderOptions );

    // a11y - the focus highlight for NumberControl should surround the Slider's thumb
    this.focusHighlight = slider.focusHighlight;

    // a11y - click the left and right arrow buttons when shift keys are down so that the shift modifier behaves
    // just like the tweaker buttons, must be disposed
    const rightButtonListener = () => { this.shiftKeyDown && rightArrowButton.a11yClick(); };
    const leftButtonListener = () => { this.shiftKeyDown && leftArrowButton.a11yClick(); };

    // emitters defined in AccessibleSlider.js
    this.attemptedIncreaseEmitter.addListener( rightButtonListener );
    this.attemptedDecreaseEmitter.addListener( leftButtonListener );

    // enabled/disable this control
    this.enabledProperty = options.enabledProperty; // @public
    const enabledObserver = enabled => {
      this.pickable = enabled;
      this.opacity = enabled ? 1.0 : options.disabledOpacity;
      // TODO if !enabled, cancel any interaction that is in progress, see scenery#218
    };
    this.enabledProperty.link( enabledObserver );

    // @private
    this.disposeNumberControl = () => {

      // dispose accessibility features
      this.attemptedIncreaseEmitter.removeListener( rightButtonListener );
      this.attemptedDecreaseEmitter.removeListener( leftButtonListener );

      numberDisplay.dispose();
      leftArrowButton.dispose();
      rightArrowButton.dispose();
      slider.dispose();

      this.thumbFillProperty && this.thumbFillProperty.dispose();

      numberProperty.unlink( arrowEnabledListener );
      this.enabledProperty.unlink( enabledObserver );
    };
  }

  /**
   * Validate all of the callback related options. There are two types of callbacks. The "start/endCallback" pair
   * are passed into all components in the NumberControl. The second set are start/end callbacks for each individual
   * component. This was added to support multitouch in Rutherford Scattering as part of
   * https://github.com/phetsims/rutherford-scattering/issues/128.
   *
   * This function mutates the options by initializing general callbacks from null (in the extend call) to a no-op
   * function.
   * @param {Object} options
   */
  function validateCallbacksAndSetDefault( options ) {
    const normalCallbacksPresent = !!( options.startCallback || options.endCallback );
    let specificCallbacksPresent = false;
    let arrowCallbacksPresent = false;
    let sliderCallbacksPresent = false;

    if ( options.arrowButtonOptions ) {
      arrowCallbacksPresent = callbackKeysInOptions( options.arrowButtonOptions );
    }

    if ( options.sliderOptions ) {
      sliderCallbacksPresent = callbackKeysInOptions( options.sliderOptions );
    }

    specificCallbacksPresent = arrowCallbacksPresent || sliderCallbacksPresent;

    // only general or component specific callbacks are supported
    assert && assert( !( normalCallbacksPresent && specificCallbacksPresent ),
      'Use general callbacks like "startCallback" or specific callbacks like "sliderOptions.startDrag" but not both.' );

    // Set here so that we can validate above based on falsey.
    options.startCallback = options.startCallback || _.noop;
    options.endCallback = options.endCallback || _.noop;
  }

  /**
   * Check for an intersection between the array of callback option keys and those
   * passed in the options object.
   *
   * @param {Object} options
   * @returns {boolean}
   */
  function callbackKeysInOptions( options ) {
    const optionKeys = Object.keys( options );
    const intersection = SPECIFIC_COMPONENT_CALLBACK_OPTIONS.filter( x => _.includes( optionKeys, x ) );
    return intersection.length > 0;
  }

  sceneryPhet.register( 'NumberControl', NumberControl );

  inherit( VBox, NumberControl, {

    // @public
    dispose: function() {
      this.disposeNumberControl();
      VBox.prototype.dispose.call( this );
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.set( enabled ); },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.get(); },
    get enabled() { return this.getEnabled(); }

  }, {

    /**
     * Creates a NumberControl with default tick marks for min and max values.
     * @param {string} label
     * @param {Property.<number>} property
     * @param {Range} range
     * @param {Object} [options]
     * @returns {NumberControl}
     * @static
     * @public
     */
    withMinMaxTicks: function( label, property, range, options ) {

      options = _.extend( {
        tickLabelFont: new PhetFont( 12 )
      }, options );

      options.sliderOptions = _.extend( {
        majorTicks: [
          { value: range.min, label: new Text( range.min, { font: options.tickLabelFont } ) },
          { value: range.max, label: new Text( range.max, { font: options.tickLabelFont } ) }
        ]
      }, options.sliderOptions );

      return new NumberControl( label, property, range, options );
    },

    /**
     * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
     * Arranges subcomponents like this:
     *
     *  title number
     *  < ------|------ >
     *
     * @param {Object} [options]
     * @returns {function}
     * @public
     * @static
     */
    createLayoutFunction1: function( options ) {

      options = _.extend( {
        align: 'center', // {string} horizontal alignment of rows, 'left'|'right'|'center'
        titleXSpacing: 5, // {number} horizontal spacing between title and number
        arrowButtonsXSpacing: 15, // {number} horizontal spacing between arrow buttons and slider
        ySpacing: 5 // {number} vertical spacing between rows
      }, options );

      return ( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton ) => {
        return new VBox( {
          align: options.align,
          spacing: options.ySpacing,
          children: [
            new HBox( {
              spacing: options.titleXSpacing,
              children: [ titleNode, numberDisplay ]
            } ),
            new HBox( {
              spacing: options.arrowButtonsXSpacing,
              resize: false, // prevent slider from causing a resize when thumb is at min or max
              children: [ leftArrowButton, slider, rightArrowButton ]
            } )
          ]
        } );
      };
    },

    /**
     * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
     * Arranges subcomponents like this:
     *
     *  title < number >
     *  ------|------
     *
     * @param {Object} [options]
     * @returns {function}
     * @public
     * @static
     */
    createLayoutFunction2: function( options ) {

      options = _.extend( {
        align: 'center', // {string} horizontal alignment of rows, 'left'|'right'|'center'
        xSpacing: 5, // {number} horizontal spacing in top row
        ySpacing: 5 // {number} vertical spacing between rows
      }, options );

      return ( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton ) => {
        return new VBox( {
          align: options.align,
          spacing: options.ySpacing,
          resize: false, // prevent slider from causing a resize when thumb is at min or max
          children: [
            new HBox( {
              spacing: options.xSpacing,
              children: [ titleNode, leftArrowButton, numberDisplay, rightArrowButton ]
            } ),
            slider
          ]
        } );
      };
    },

    /**
     * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
     * Arranges subcomponents like this:
     *
     *  title
     *  < number >
     *  -------|-------
     *
     * @param {Object} [options]
     * @returns {function}
     * @public
     * @static
     */
    createLayoutFunction3: function( options ) {

      options = _.extend( {
        alignTitle: 'center', // {string} horizontal alignment of title, relative to slider, 'left'|'right'|'center'
        alignNumber: 'center', // {string} horizontal alignment of number display, relative to slider, 'left'|'right'|'center'
        titleLeftIndent: 0, // {number|null}  if provided, add an HStrut on the left of the title to push the title to the right
        xSpacing: 5, // {number} horizontal spacing between arrow buttons and slider
        ySpacing: 5 // {number} vertical spacing between rows
      }, options );

      return ( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton ) => {
        return new VBox( {
          spacing: options.ySpacing,
          resize: false, // prevent slider from causing a resize when thumb is at min or max
          align: options.alignTitle,
          children: [
            new AlignBox( titleNode, { leftMargin: options.titleLeftIndent } ),
            new VBox( {
              spacing: options.ySpacing,
              resize: false, // prevent slider from causing a resize when thumb is at min or max
              align: options.alignNumber,
              children: [
                new HBox( {
                  spacing: options.xSpacing,
                  children: [ leftArrowButton, numberDisplay, rightArrowButton ]
                } ),
                slider
              ]
            } )
          ]
        } );
      };
    },

    /**
     * Like layoutFunction1, but the title and value go all the way to the edges. Ported from PendulumNumberControl.js
     * on March 14, 2018.
     * @param {Object} [options]
     * @returns {Function}
     */
    createLayoutFunction4: function( options ) {
      options = _.extend( {
        excludeTweakers: false,
        sliderPadding: 0,
        verticalSpacing: 5,
        hasReadoutProperty: null,
        createBottomContent: null // Supports Pendulum Lab's questionText where a question is substituted for the slider
      }, options );
      return ( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton ) => {
        const bottomBox = new HBox( {
          resize: false, // prevent slider from causing resize?
          spacing: 5,
          children: options.excludeTweakers ? [ slider ] : [
            leftArrowButton,
            slider,
            rightArrowButton
          ]
        } );
        const bottomContent = options.createBottomContent ? options.createBottomContent( bottomBox ) : bottomBox;

        const group = new AlignGroup( { matchHorizontal: false } );
        const titleBox = new AlignBox( titleNode, {
          group: group
        } );
        const numberBox = new AlignBox( numberDisplay, {
          group: group
        } );
        titleBox.bottom = numberBox.bottom = bottomContent.top - options.verticalSpacing;
        titleBox.left = bottomContent.left - options.sliderPadding;
        numberBox.right = bottomContent.right + options.sliderPadding;
        const node = new Node( { children: [ bottomContent, titleBox, numberBox ] } );
        if ( options.hasReadoutProperty ) {
          options.hasReadoutProperty.link( hasReadout => { numberBox.visible = hasReadout; } );
        }
        return node;
      };
    }
  } );

  // mix accessibility features into NumberControl
  AccessibleSlider.mixInto( NumberControl );

  return NumberControl;
} );
