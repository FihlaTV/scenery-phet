// Copyright 2017-2018, University of Colorado Boulder

/**
 * Semi-transparent black barrier used to block input events when a dialog (or other popup) is present, and fade out
 * the background.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BarrierRectangleIO = require( 'SCENERY_PHET/BarrierRectangleIO' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {ObservableArray} modalNodeStack - see usage in Sim.js
   * @param {Object} [options]
   * @constructor
   */
  function BarrierRectangle( modalNodeStack, options ) {
    var self = this;

    options = _.extend( {
      tandem: Tandem.required,
      phetioType: BarrierRectangleIO,
      phetioReadOnly: true, // Disable controls in instance proxies
      phetioState: false
    }, options );

    Plane.call( this );

    modalNodeStack.lengthProperty.link( function( numBarriers ) {
      self.visible = numBarriers > 0;
    } );

    this.addInputListener( new ButtonListener( {
      fire: function( event ) {
        self.startEvent( 'user', 'fired' );
        assert && assert( modalNodeStack.length > 0, 'There must be a Node in the stack to hide.' );
        modalNodeStack.get( modalNodeStack.length - 1 ).hide();
        self.endEvent();
      }
    } ) );

    // @private
    this.disposeBarrierRectangle = function() {
      modalNodeStack.lengthProperty.unlink();
    };

    this.mutate( options );
  }

  sceneryPhet.register( 'BarrierRectangle', BarrierRectangle );

  return inherit( Plane, BarrierRectangle, {

    // @public
    dispose: function() {
      this.disposeBarrierRectangle();
      Plane.prototype.dispose.call( this );
    }
  } );
} );