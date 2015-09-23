// Copyright 2002-2014, University of Colorado Boulder

/**
 * Button for toggling sound on and off.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var BooleanRectangularToggleButton = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );

  // constants
  var WIDTH = 45;
  var HEIGHT = 45;
  var MARGIN = 4;
  var X_WIDTH = WIDTH * 0.25; // Empirically determined.

  // strings
  var soundToggleButtonString = require( 'string!SCENERY_PHET/SoundToggleButton.name' );

  /**
   *
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   * @constructor
   */
  function SoundToggleButton( property, options ) {
    var soundToggleButton = this;
    var soundOffNode = new Node();
    var soundOnNode = new FontAwesomeNode( 'volume_up' );
    var contentScale = ( WIDTH - ( 2 * MARGIN ) ) / soundOnNode.width;
    soundOnNode.scale( contentScale );
    soundOffNode.addChild( new FontAwesomeNode( 'volume_off', { scale: contentScale } ) );
    var soundOffX = new Path( new Shape().moveTo( 0, 0 ).lineTo( X_WIDTH, X_WIDTH ).moveTo( 0, X_WIDTH ).lineTo( X_WIDTH, 0 ),
      {
        stroke: 'black',
        lineWidth: 3,
        left: soundOffNode.width + 5,
        centerY: soundOffNode.centerY
      } );
    soundOffNode.addChild( soundOffX );

    BooleanRectangularToggleButton.call( this, soundOnNode, soundOffNode, property, _.extend( {
      baseColor: new Color( 242, 233, 22 ),//Color match with the yellow in the PhET logo
      minWidth: WIDTH,
      minHeight: HEIGHT,
      xMargin: MARGIN,
      yMargin: MARGIN,
      accessibleContent: {
        createPeer: function( accessibleInstance ) {
          // will look like <input value="Sound Button" type="button" tabindex="0">
          var domElement = document.createElement( 'input' );
          domElement.value = soundToggleButtonString;
          domElement.type = 'button';

          domElement.tabIndex = '0';

          domElement.addEventListener( 'click', function() {
            // toggle the button property
            property.set( !property.value );
          } );

          return new AccessiblePeer( accessibleInstance, domElement );
        }
      }
    }, options ) );

    property.link( function( value ) {
      var checkedText = (value ? 'checked' : 'unchecked');
      soundToggleButton.textDescription = 'Sound Checkbox (' + checkedText + ')';
    } );
  }

  return inherit( BooleanRectangularToggleButton, SoundToggleButton );
} );