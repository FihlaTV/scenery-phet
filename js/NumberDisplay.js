// Copyright 2015-2019, University of Colorado Boulder

/**
 * Displays a Property of type {number} in a background rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberDisplayIO = require( 'SCENERY_PHET/NumberDisplayIO' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // valid values for options.align and options.noValueAlign
  var ALIGN_VALUES = [ 'center', 'left', 'right' ];

  /**
   * @param {Property.<number|null>} numberProperty
   * @param {Range} numberRange
   * @param {Object} [options]
   * @constructor
   */
  function NumberDisplay( numberProperty, numberRange, options ) {

    options = _.extend( {
      align: 'right', // see ALIGN_VALUES

      // {string} Pattern used to format the value. Must contain '{{value}}' or '{0}'.
      // If you want units or other verbiage, add them to the pattern, e.g. '{{value}} L'
      valuePattern: NumberDisplay.DEFAULT_VALUE_PATTERN,
      useRichText: false,
      font: new PhetFont( 20 ),
      decimalPlaces: 0,
      xMargin: 8,
      yMargin: 2,
      cornerRadius: 0,
      numberFill: 'black',
      numberMaxWidth: 200,
      backgroundFill: 'white',
      backgroundStroke: 'lightGray',
      backgroundLineWidth: 1,
      minBackgroundWidth: 0,

      // options related to display when numberProperty.value === null
      noValueString: MathSymbols.NO_VALUE, // {string} default is the PhET standard, do no override lightly.
      noValueAlign: null, // {string|null} see ALIGN_VALUES. If null, defaults to options.align
      noValuePattern: null, // {string|null} If null, defaults to options.valuePattern

      // phet-io
      tandem: Tandem.optional,
      phetioType: NumberDisplayIO
    }, options );

    // Set defaults
    if ( !options.noValueAlign ) {
      options.noValueAlign = options.align;
    }
    if ( !options.noValuePattern ) {
      options.noValuePattern = options.valuePattern;
    }

    // validate options
    assert && assert( _.includes( ALIGN_VALUES, options.align ), 'invalid align: ' + options.align );
    assert && assert( _.includes( ALIGN_VALUES, options.noValueAlign ), 'invalid noValueAlign: ' + options.noValueAlign );

    // Support numbered (old-style) placeholders by replacing '{0}' with '{{value}}'.
    // See https://github.com/phetsims/scenery-phet/issues/446
    if ( options.valuePattern.indexOf( NumberDisplay.NUMBERED_PLACEHOLDER ) !== -1 ) {
      options.valuePattern = StringUtils.format( options.valuePattern, NumberDisplay.NAMED_PLACEHOLDER );
    }

    var self = this;

    // determine the widest value
    var minString = Util.toFixed( numberRange.min, options.decimalPlaces );
    var maxString = Util.toFixed( numberRange.max, options.decimalPlaces );
    var longestString = StringUtils.fillIn( options.valuePattern, {
      value: ( ( minString.length > maxString.length ) ? minString : maxString )
    } );

    // value
    var Constructor = options.useRichText ? RichText : Text;
    this.valueNode = new Constructor( longestString, {
      font: options.font,
      fill: options.numberFill,
      maxWidth: options.numberMaxWidth,
      tandem: options.tandem.createTandem( 'valueNode' )
    } );

    var backgroundWidth = Math.max( options.minBackgroundWidth, this.valueNode.width + 2 * options.xMargin );

    // @private background
    this.backgroundNode = new Rectangle( 0, 0, backgroundWidth, this.valueNode.height + 2 * options.yMargin, {
      cornerRadius: options.cornerRadius,
      fill: options.backgroundFill,
      stroke: options.backgroundStroke,
      lineWidth: options.backgroundLineWidth
    } );
    this.valueNode.centerY = this.backgroundNode.centerY;

    options.children = [ this.backgroundNode, this.valueNode ];

    // display the value
    var numberObserver = function( value ) {

      const valuePattern = ( value === null ) ? options.noValuePattern : options.valuePattern;
      const stringValue = ( value === null ) ? options.noValueString : Util.toFixed( value, options.decimalPlaces );
      const align = ( value === null ) ? options.noValueAlign : options.align;

      // update the value
      self.valueNode.text = StringUtils.fillIn( valuePattern, {
        value: stringValue
      } );

      // horizontally align value in background
      if ( align === 'center' ) {
        self.valueNode.centerX = self.backgroundNode.centerX;
      }
      else if ( align === 'left' ) {
        self.valueNode.left = self.backgroundNode.left + options.xMargin;
      }
      else { // right
        self.valueNode.right = self.backgroundNode.right - options.xMargin;
      }
    };
    numberProperty.link( numberObserver );

    // @private called by dispose
    this.disposeNumberDisplay = function() {
      numberProperty.unlink( numberObserver );
    };

    Node.call( this, options );
  }

  sceneryPhet.register( 'NumberDisplay', NumberDisplay );

  inherit( Node, NumberDisplay, {

    // @public
    dispose: function() {
      this.disposeNumberDisplay();
      Node.prototype.dispose.call( this );
    },

    /**
     * Sets the number text font.
     * @param {Font} font
     * @public
     */
    setNumberFont: function( font ) {
      this.valueNode.font = font;
    },
    set numberFont( value ) { this.setNumberFont( value ); },

    /**
     * Sets the number text fill.
     * @param {Color|string} fill
     * @public
     */
    setNumberFill: function( fill ) {
      this.valueNode.fill = fill;
    },
    set numberFill( value ) { this.setNumberFill( value ); },

    /**
     * Sets the background fill.
     * @param {Color|string} fill
     * @public
     */
    setBackgroundFill: function( fill ) {
      this.backgroundNode.fill = fill;
    },
    set backgroundFill( value ) { this.setBackgroundFill( value ); },

    /**
     * Sets the background stroke.
     * @param {Color|string} stroke
     * @public
     */
    setBackgroundStroke: function( stroke ) {
      this.backgroundNode.stroke = stroke;
    },
    set backgroundStroke( value ) { this.setBackgroundStroke( value ); }
  } );

  /**
   * Use this only if you need to change some other placeholder to NAMED_PLACEHOLDER. E.g.:
   * valueFormat: StringUtils.fillIn( '{{voltage}} V', { voltage: NumberDisplay.NAMED_PLACEHOLDER } );
   * @public
   * @static
   */
  NumberDisplay.NAMED_PLACEHOLDER = '{{value}}';

  /**
   * Use this only if you're creating options.valueFormat, and are stuck with using StringUtils.format. E.g.:
   * valueFormat: StringUtils.format( '{0} {1}', NumberDisplay.NUMBERED_PLACEHOLDER, 'V' );
   * @public
   * @static
   */
  NumberDisplay.NUMBERED_PLACEHOLDER = '{0}';

  // @public @static
  NumberDisplay.DEFAULT_VALUE_PATTERN = NumberDisplay.NAMED_PLACEHOLDER;

  return NumberDisplay;
} );
