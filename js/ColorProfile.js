// Copyright 2002-2015, University of Colorado Boulder

/**
 * Abstract class for color profiles for simulations. See GravityAndOrbitsColors for an example.
 * This file was modelled after MoleculeShapesColors.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  function ColorProfile( colors ) {

    var thisProfile = this;

    this.colors = colors; // @private

    // initial properties object, to load into the PropertySet (so reset works nicely)
    var initialProperties = {};
    for ( var key in colors ) {
      initialProperties[ key ] = colors[ key ].default;
    }
    PropertySet.call( this, initialProperties );

    // initial communication
    for ( var colorName in colors ) {
      this.reportColor( colorName );
    }

    // receives iframe communication to set a color
    window.addEventListener( 'message', function( evt ) {
      var data = JSON.parse( evt.data );
      if ( data.type === 'setColor' ) {
        thisProfile[ data.name ] = new Color( data.value );
      }
    } );

  }

  return inherit( PropertySet, ColorProfile, {

    /**
     * Applies all colors for the specific named color scheme, ignoring colors that aren't specified for it.
     * @param {string} profileName - one of 'default', 'basics' or 'projector'
     */
    applyProfile: function( profileName ) {
      assert && assert( profileName === 'default' || profileName === 'projector' );

      for ( var key in this.colors ) {
        if ( profileName in this.colors[ key ] ) {
          var oldColor = this[ key ];
          var newColor = this.colors[ key ][ profileName ];
          if ( !newColor.equals( oldColor ) ) {
            this[ key ] = newColor;
            this.reportColor( key );
          }
        }
      }
      this.trigger( 'profileChanged' );
    },

    // sends iframe communication to report the current color for the key name
    reportColor: function( key ) {
      var hexColor = this[ key ].toNumber().toString( 16 );
      while ( hexColor.length < 6 ) {
        hexColor = '0' + hexColor;
      }

      window.parent && window.parent.postMessage( JSON.stringify( {
        type: 'reportColor',
        name: key,
        value: '#' + hexColor
      } ), '*' );
    }
  } );
} );
