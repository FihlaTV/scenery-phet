// Copyright 2014-2019, University of Colorado Boulder

/**
 * Shows a readout of the elapsed time, with play and pause buttons.  By default there are no units (which could be used
 * if all of a simulations time units are in 'seconds'), or you can specify a selection of units to choose from.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Anton Ulyanov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const BooleanRectangularToggleButton = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PauseIconShape = require( 'SCENERY_PHET/PauseIconShape' );
  const PlayIconShape = require( 'SCENERY_PHET/PlayIconShape' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  const Tandem = require( 'TANDEM/Tandem' );
  const TimerReadoutNode = require( 'SCENERY_PHET/TimerReadoutNode' );
  const UTurnArrowShape = require( 'SCENERY_PHET/UTurnArrowShape' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {Property.<number>} timeProperty
   * @param {Property.<boolean>} runningProperty
   * @param {Object} [options]
   * @constructor
   */
  function TimerNode( timeProperty, runningProperty, options ) {

    options = _.extend( {

      // See also options that pass through to TimerReadoutNode
      cursor: 'pointer',
      iconHeight: 10,
      iconFill: 'black',
      iconLineWidth: 1,
      backgroundBaseColor: 'rgb(  80, 130, 230  )',
      buttonBaseColor: '#DFE0E1',
      xSpacing: 6, // horizontal space between the buttons
      ySpacing: 6, // vertical space between readout and buttons
      xMargin: 8,
      yMargin: 8,

      // {number} the maximum time value, in seconds. See TimerReadoutNode options.maxValue
      maxValue: TimerReadoutNode.DEFAULT_MAX_VALUE,

      // options propagated to TimerReadoutNode
      timerReadoutNodeOptions: null,

      // Tandem is required to make sure the buttons are instrumented
      tandem: Tandem.required
    }, options );

    assert && assert( options.xSpacing >= 0, 'Buttons cannot overlap' );
    assert && assert( options.ySpacing >= 0, 'Buttons cannot overlap the readout' );

    // fill in timerReadoutNodeOptions defaults
    assert && assert( !options.timerReadoutNodeOptions || options.timerReadoutNodeOptions.maxValue === undefined,
      'TimerNode sets maxValue' );
    options.timerReadoutNodeOptions = options.timerReadoutNodeOptions || {};
    options.timerReadoutNodeOptions.maxValue = options.maxValue;

    // Create the TimerReadoutNode.  If we need more flexibility for this part, consider inversion of control
    var timerReadoutNode = new TimerReadoutNode( timeProperty, options.timerReadoutNodeOptions );

    // Buttons ----------------------------------------------------------------------------

    var resetPath = new Path( new UTurnArrowShape( options.iconHeight ), {
      fill: options.iconFill
    } );

    var playIconHeight = resetPath.height;
    var playIconWidth = 0.8 * playIconHeight;
    var playPath = new Path( new PlayIconShape( playIconWidth, playIconHeight ), {
      fill: options.iconFill
    } );

    var pausePath = new Path( new PauseIconShape( 0.75 * playIconWidth, playIconHeight ), {
      fill: options.iconFill
    } );

    var playPauseButton = new BooleanRectangularToggleButton( pausePath, playPath, runningProperty, {
      baseColor: options.buttonBaseColor,
      tandem: options.tandem.createTandem( 'playPauseButton' )
    } );

    var resetButton = new RectangularPushButton( {
      listener: function resetTimer() {
        runningProperty.set( false );
        timeProperty.set( 0 );
      },
      content: resetPath,
      baseColor: options.buttonBaseColor,
      tandem: options.tandem.createTandem( 'resetButton' )
    } );

    var contents = new VBox( {
      spacing: options.ySpacing,
      children: [
        timerReadoutNode,
        new HBox( {
          spacing: options.xSpacing,
          children: [ resetButton, playPauseButton ]
        } )
      ]
    } );

    // Background panel ----------------------------------------------------------------------------

    var backgroundNode = new ShadedRectangle( new Bounds2( 0, 0,
      contents.width + 2 * options.xMargin, contents.height + 2 * options.yMargin ), {
      baseColor: options.backgroundBaseColor
    } );
    contents.center = backgroundNode.center;

    assert && assert( !options.children, 'TimerNode sets children' );
    options.children = [ backgroundNode, contents ];

    Node.call( this, options );

    // @public (read-only) - Target for drag listeners
    this.dragTarget = backgroundNode;

    // Disable the reset button when time is zero.
    var timeListener = function( time ) {
      resetButton.enabled = time > 0;
      playPauseButton.enabled = time < options.maxValue;
      if ( time >= options.maxValue ) {
        runningProperty.value = false;
      }
    };
    timeProperty.link( timeListener );

    // @private
    this.disposeTimerNode = function() {
      timerReadoutNode.dispose();
      timeProperty.unlink( timeListener );
      resetButton.dispose();
      playPauseButton.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'TimerNode', this );
  }

  sceneryPhet.register( 'TimerNode', TimerNode );

  return inherit( Node, TimerNode, {

    /**
     * Release resources when no longer be used.
     * @public
     */
    dispose: function() {
      this.disposeTimerNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );