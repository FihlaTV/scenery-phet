// Copyright 2013-2019, University of Colorado Boulder

/**
 * SpectrumSlider is a slider-like control used for choosing a value that corresponds to a displayed color.
 * It is a parent type for WavelengthSlider.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AccessibleSlider = require( 'SUN/accessibility/AccessibleSlider' );
  const ArrowButton = require( 'SUN/buttons/ArrowButton' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Color = require( 'SCENERY/util/Color' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const FocusHighlightFromNode = require( 'SCENERY/accessibility/FocusHighlightFromNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const Shape = require( 'KITE/Shape' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const SpectrumNode = require( 'SCENERY_PHET/SpectrumNode' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );

  /**
   * @param {Property.<number>} valueProperty
   * @param {Object} [options]
   * @mixes AccessibleSlider
   * @constructor
   */
  function SpectrumSlider( valueProperty, options ) {

    const self = this;

    // options that are specific to this type
    options = merge( {

      // {number} The minimum value to be displayed
      minValue: 0,

      // {number} The minimum value to be displayed
      maxValue: 1,

      // {function} Maps {number} to text that is optionally displayed by the slider
      valueToString: function( value ) {return value + '';},

      // {function} Maps {number} to Color that is rendered in the spectrum and in the thumb
      valueToColor: function( value ) {return new Color( 0, 0, 255 * value );},

      // track
      trackWidth: 150,
      trackHeight: 30,
      trackOpacity: 1,
      trackBorderStroke: 'black',

      // thumb
      thumbWidth: 35,
      thumbHeight: 45,
      thumbTouchAreaXDilation: 12,
      thumbTouchAreaYDilation: 10,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,

      // value
      valueFont: new PhetFont( 20 ),
      valueFill: 'black',
      valueVisible: true,
      valueYSpacing: 2, // {number} space between value and top of track

      // tweakers
      tweakersVisible: true,
      tweakerValueDelta: 1, // {number} the amount that value changes when a tweaker button is pressed
      tweakersXSpacing: 8, // {number} space between tweakers and track
      maxTweakersHeight: 30,
      tweakersTouchAreaXDilation: 7,
      tweakersTouchAreaYDilation: 7,
      tweakersMouseAreaXDilation: 0,
      tweakersMouseAreaYDilation: 0,

      // cursor, the rectangle than follows the thumb in the track
      cursorVisible: true,
      cursorStroke: 'black',

      // phet-io
      tandem: Tandem.REQUIRED

    }, options );

    // validate values
    assert && assert( options.minValue < options.maxValue );

    Node.call( this );

    const track = new SpectrumNode( {
      valueToColor: options.valueToColor,
      size: new Dimension2( options.trackWidth, options.trackHeight ),
      minValue: options.minValue,
      maxValue: options.maxValue,
      opacity: options.trackOpacity,
      cursor: 'pointer'
    } );

    /*
     * Put a border around the track.
     * We don't stroke the track itself because stroking the track will affect its bounds,
     * and will thus affect the drag handle behavior.
     * Having a separate border also gives subclasses a place to add markings (eg, tick marks)
     * without affecting the track's bounds.
     */
    const trackBorder = new Rectangle( 0, 0, track.width, track.height, {
      stroke: options.trackBorderStroke,
      lineWidth: 1,
      pickable: false
    } );

    let valueDisplay;
    if ( options.valueVisible ) {
      valueDisplay = new ValueDisplay( valueProperty, options.valueToString, {
        font: options.valueFont,
        fill: options.valueFill,
        bottom: track.top - options.valueYSpacing
      } );
    }

    let cursor;
    if ( options.cursorVisible ) {
      cursor = new Cursor( 3, track.height, {
        stroke: options.cursorStroke,
        top: track.top
      } );
    }

    const thumb = new Thumb( options.thumbWidth, options.thumbHeight, {
      cursor: 'pointer',
      top: track.bottom
    } );

    // thumb touchArea
    if ( options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation ) {
      thumb.touchArea = thumb.localBounds
        .dilatedXY( options.thumbTouchAreaXDilation, options.thumbTouchAreaYDilation )
        .shiftedY( options.thumbTouchAreaYDilation );
    }

    // thumb mouseArea
    if ( options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation ) {
      thumb.mouseArea = thumb.localBounds
        .dilatedXY( options.thumbMouseAreaXDilation, options.thumbMouseAreaYDilation )
        .shiftedY( options.thumbMouseAreaYDilation );
    }

    // tweaker buttons for single-unit increments
    let plusButton;
    let minusButton;
    if ( options.tweakersVisible ) {

      plusButton = new ArrowButton( 'right', function() {

        // Increase the value, but keep it in range
        valueProperty.set( Math.min( options.maxValue, valueProperty.get() + options.tweakerValueDelta ) );
      }, {
        left: track.right + options.tweakersXSpacing,
        centerY: track.centerY,
        maxHeight: options.maxTweakersHeight,
        tandem: options.tandem.createTandem( 'plusButton' )
      } );

      minusButton = new ArrowButton( 'left', function() {

        // Decrease the value, but keep it in range
        valueProperty.set( Math.max( options.minValue, valueProperty.get() - options.tweakerValueDelta ) );
      }, {
        right: track.left - options.tweakersXSpacing,
        centerY: track.centerY,
        maxHeight: options.maxTweakersHeight,
        tandem: options.tandem.createTandem( 'minusButton' )
      } );

      // tweakers touchArea
      plusButton.touchArea = plusButton.localBounds
        .dilatedXY( options.tweakersTouchAreaXDilation, options.tweakersTouchAreaYDilation )
        .shiftedX( options.tweakersTouchAreaXDilation );
      minusButton.touchArea = minusButton.localBounds
        .dilatedXY( options.tweakersTouchAreaXDilation, options.tweakersTouchAreaYDilation )
        .shiftedX( -options.tweakersTouchAreaXDilation );

      // tweakers mouseArea
      plusButton.mouseArea = plusButton.localBounds
        .dilatedXY( options.tweakersMouseAreaXDilation, options.tweakersMouseAreaYDilation )
        .shiftedX( options.tweakersMouseAreaXDilation );
      minusButton.mouseArea = minusButton.localBounds
        .dilatedXY( options.tweakersMouseAreaXDilation, options.tweakersMouseAreaYDilation )
        .shiftedX( -options.tweakersMouseAreaXDilation );
    }

    // rendering order
    this.addChild( track );
    this.addChild( trackBorder );
    this.addChild( thumb );
    valueDisplay && this.addChild( valueDisplay );
    cursor && this.addChild( cursor );
    plusButton && this.addChild( plusButton );
    minusButton && this.addChild( minusButton );

    // transforms between position and value
    const positionToValue = function( x ) {
      return Utils.clamp( Utils.linear( 0, track.width, options.minValue, options.maxValue, x ), options.minValue, options.maxValue );
    };
    const valueToPosition = function( value ) {
      return Utils.clamp( Utils.linear( options.minValue, options.maxValue, 0, track.width, value ), 0, track.width );
    };

    // click in the track to change the value, continue dragging if desired
    const handleTrackEvent = function( event ) {
      const x = thumb.globalToParentPoint( event.pointer.point ).x;
      const value = positionToValue( x );
      valueProperty.set( value );
    };

    track.addInputListener( new SimpleDragHandler( {

      tandem: options.tandem.createTandem( 'trackInputListener' ),

      start: function( event, trail ) {
        handleTrackEvent( event );
      },

      drag: function( event, trail ) {
        handleTrackEvent( event );
      }
    } ) );

    // thumb drag handler
    let clickXOffset = 0; // x-offset between initial click and thumb's origin
    thumb.addInputListener( new SimpleDragHandler( {

      tandem: options.tandem.createTandem( 'thumbInputListener' ),

      allowTouchSnag: true,

      start: function( event ) {
        clickXOffset = thumb.globalToParentPoint( event.pointer.point ).x - thumb.x;
      },

      drag: function( event ) {
        const x = thumb.globalToParentPoint( event.pointer.point ).x - clickXOffset;
        const value = positionToValue( x );
        valueProperty.set( value );
      }
    } ) );

    // @public (a11y) - custom focus highlight that surrounds and moves with the thumb
    this.focusHighlight = new FocusHighlightFromNode( thumb );

    // sync with model
    const updateUI = function( value ) {
      // positions
      const x = valueToPosition( value );
      thumb.centerX = x;
      if ( cursor ) { cursor.centerX = x; }
      if ( valueDisplay ) { valueDisplay.centerX = x; }
      // thumb color
      thumb.fill = options.valueToColor( value );
      // tweaker buttons
      if ( options.tweakersVisible ) {
        plusButton.enabled = ( value < options.maxValue );
        minusButton.enabled = ( value > options.minValue );
      }
    };
    const valueListener = function( value ) {
      updateUI( value );
    };
    valueProperty.link( valueListener );

    /*
     * The horizontal bounds of the value control changes as the slider knob is dragged.
     * To prevent this, we determine the extents of the control's bounds at min and max values,
     * then add an invisible horizontal strut.
     */
    // determine bounds at min and max values
    updateUI( options.minValue );
    const minX = this.left;
    updateUI( options.maxValue );
    const maxX = this.right;

    // restore the initial value
    updateUI( valueProperty.get() );

    // add a horizontal strut
    const strut = new Rectangle( minX, 0, maxX - minX, 1, { pickable: false } );
    this.addChild( strut );
    strut.moveToBack();

    this.mutate( options );

    // @private - called by dispose
    this.disposeSpectrumSlider = function() {
      valueDisplay && valueDisplay.dispose();
      plusButton && plusButton.dispose();
      minusButton && minusButton.dispose();
      valueProperty.unlink( valueListener );
      self.disposeAccessibleSlider(); // dispose accessibility
    };

    // mix accessible slider functionality into HSlider
    const rangeProperty = new Property( new Range( options.minValue, options.maxValue ) );
    this.initializeAccessibleSlider( valueProperty, rangeProperty, new BooleanProperty( true ), options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'SpectrumSlider', this );
  }

  sceneryPhet.register( 'SpectrumSlider', SpectrumSlider );

  /**
   * The slider thumb, origin at top center.
   *
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   * @constructor
   */
  function Thumb( width, height, options ) {

    options = merge( {
      stroke: 'black',
      lineWidth: 1,
      fill: 'black'
    }, options );

    // Set the radius of the arcs based on the height or width, whichever is smaller.
    const radiusScale = 0.15;
    const radius = ( width < height ) ? radiusScale * width : radiusScale * height;

    // Calculate some parameters of the upper triangles of the thumb for getting arc offsets.
    const hypotenuse = Math.sqrt( Math.pow( 0.5 * width, 2 ) + Math.pow( 0.3 * height, 2 ) );
    const angle = Math.acos( width * 0.5 / hypotenuse );
    const heightOffset = radius * Math.sin( angle );

    // Draw the thumb shape starting at the right upper corner of the pentagon below the arc,
    // this way we can get the arc coordinates for the arc in this corner from the other side,
    // which will be easier to calculate arcing from bottom to top.
    const shape = new Shape()
      .moveTo( 0.5 * width, 0.3 * height + heightOffset )
      .lineTo( 0.5 * width, height - radius )
      .arc( 0.5 * width - radius, height - radius, radius, 0, Math.PI / 2 )
      .lineTo( -0.5 * width + radius, height )
      .arc( -0.5 * width + radius, height - radius, radius, Math.PI / 2, Math.PI )
      .lineTo( -0.5 * width, 0.3 * height + heightOffset )
      .arc( -0.5 * width + radius, 0.3 * height + heightOffset, radius, Math.PI, Math.PI + angle );

    // Save the coordinates for the point above the left side arc, for use on the other side.
    const sideArcPoint = shape.getLastPoint();

    shape.lineTo( 0, 0 )
      .lineTo( -sideArcPoint.x, sideArcPoint.y )
      .arc( 0.5 * width - radius, 0.3 * height + heightOffset, radius, -angle, 0 )
      .close();

    Path.call( this, shape, options );
  }

  inherit( Path, Thumb );

  /**
   * Displays the value and units.
   *
   * @param {Property} valueProperty
   * @param {function} valueToString converts value {number} to text {string} for display
   * @param {Object} [options]
   * @constructor
   */
  function ValueDisplay( valueProperty, valueToString, options ) {

    Text.call( this, '?', options );

    const self = this;
    const valueObserver = function( value ) {
      self.text = valueToString( value );
    };
    valueProperty.link( valueObserver );

    // @private called by dispose
    this.disposeValueDisplay = function() {
      valueProperty.unlink( valueObserver );
    };
  }

  inherit( Text, ValueDisplay, {

    dispose: function() {
      this.disposeValueDisplay();
      Text.prototype.dispose.call( this );
    }
  } );

  //TODO better name for this, that doesn't conflict with scenery cursor
  /**
   * Rectangular 'cursor' that appears in the track directly above the thumb. Origin is at top center.
   *
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   * @constructor
   */
  function Cursor( width, height, options ) {
    Rectangle.call( this, -width / 2, 0, width, height, options );
  }

  inherit( Rectangle, Cursor );

  inherit( Node, SpectrumSlider, {

    // @public
    dispose: function() {
      this.disposeSpectrumSlider();
      Node.prototype.dispose.call( this );
    }
  } );

  // mix accessibility in
  AccessibleSlider.mixInto( SpectrumSlider );

  return SpectrumSlider;
} );
