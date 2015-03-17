// Copyright 2002-2013, University of Colorado Boulder

/**
 * A drag handler for something has a location and is constrained to some (optional) bounds.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Property.<Vector2>} locationProperty - in model reference frame
   * @param {Object} [options]
   * @constructor
   */
  function MovableDragHandler( locationProperty, options ) {

    var self = this;

    options = _.extend( {
      dragBounds: Bounds2.EVERYTHING , // {Bounds2} dragging will be constrained to these optional bounds , in model reference frame
      modelViewTransform: ModelViewTransform2.createIdentity(), // {ModelViewTransform2} defaults to identity
      startDrag: function( event ) {},  // use this to do something at the start of dragging, like moving a node to the foreground
      endDrag: function( event ) {},  // use this to do something at the end of dragging, like 'snapping'
      componentID: null
    }, options );

    //@public
    this.componentID = options.componentID;

    this.locationProperty = locationProperty; // @private
    this._dragBounds = options.dragBounds.copy(); // @private

    var startOffset; // where the drag started, relative to the Movable's origin, in parent view coordinates

    SimpleDragHandler.call( this, {

      allowTouchSnag: true,

      // note where the drag started
      start: function( event ) {

        var archID = arch && arch.start( 'user', self.componentID, 'dragStart', {
            positionX: locationProperty.get().x,
            positionY: locationProperty.get().y
          } );
        options.startDrag( event );
        var location = options.modelViewTransform.modelToViewPosition( locationProperty.get() );
        startOffset = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( location );

        arch && arch.end( archID );
      },

      // change the location, adjust for starting offset, constrain to drag bounds
      drag: function( event ) {

        var parentPoint = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( startOffset );
        var location = options.modelViewTransform.viewToModelPosition( parentPoint );
        if ( self._dragBounds ) {
          location = constrainLocation( location, self._dragBounds );
        }
        var archID = arch && arch.start( 'user', self.componentID, 'drag', {
            positionX: location.x,
            positionY: location.y
          } );
        locationProperty.set( location );

        arch && arch.end( archID );
      },

      end: function( event ) {
        var archID = arch && arch.start( 'user', self.componentID, 'dragEnd', {
            positionX: locationProperty.get().x,
            positionY: locationProperty.get().y
          } );
        options.endDrag( event );
        arch && arch.end( archID );
      }
    } );
  }

  /**
   * Constrains a location to some bounds.
   * It returns (1) the same location if the location is within the bounds
   * or (2) a location on the edge of the bounds if the location is outside the bounds
   * @param {Vector2} location
   * @param {Bounds2} bounds
   * @returns {Vector2}
   */
  var constrainLocation = function( location, bounds ) {
    if ( bounds.containsCoordinates( location.x, location.y ) ) {
      return location;
    }
    else {
      var xConstrained = Math.max( Math.min( location.x, bounds.maxX ), bounds.x );
      var yConstrained = Math.max( Math.min( location.y, bounds.maxY ), bounds.y );
      return new Vector2( xConstrained, yConstrained );
    }
  };

  return inherit( SimpleDragHandler, MovableDragHandler,{
    /**
     * Set the dragBounds.
     * In addition, it forces the location to be within the bounds.
     * @param {Bounds2} dragBounds
     */
    setDragBounds: function( dragBounds ) {
      this._dragBounds = dragBounds.copy();
      this.locationProperty.set( constrainLocation( this.locationProperty.value, this._dragBounds ) );
    },

    /**
     * Return the dragBounds of the sim
     * @returns {Bounds2}
     */
    getDragBounds: function() {
      return this._dragBounds;
    },

    // ES5 getter and setter for the dragBounds
    set dragBounds( value ) { this.setDragBounds( value ); },
    get dragBounds() { return this.getDragBounds(); }

  } );
} );
