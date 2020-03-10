// Copyright 2018-2020, University of Colorado Boulder

/**
 * Combines the Play/Pause button and the Step button with optional speed controls.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const Panel = require( 'SUN/Panel' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );
  const StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  const StepBackwardButton = require( 'SCENERY_PHET/buttons/StepBackwardButton' );
  const SunConstants = require( 'SUN/SunConstants' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  const speedNormalString = require( 'string!SCENERY_PHET/speed.normal' );
  const speedSlowString = require( 'string!SCENERY_PHET/speed.slow' );
  const speedFastString = require( 'string!SCENERY_PHET/speed.fast' );

  // PDOM strings
  const timeControlDescriptionString = SceneryPhetA11yStrings.timeControlDescription.value;
  const timeControlLabelString = SceneryPhetA11yStrings.timeControlLabel.value;
  const simSpeedsString = SceneryPhetA11yStrings.simSpeedsString.value;

  // constants
  // supported speeds for SpeedRadioButtonGroup
  const TimeControlSpeeds = Enumeration.byKeys( [ 'FAST', 'NORMAL', 'SLOW' ] );
  const DEFAULT_TIME_CONTROL_SPEEDS = [ TimeControlSpeeds.NORMAL, TimeControlSpeeds.SLOW ];

  const SPEED_LABEL_MAP = new Map();
  SPEED_LABEL_MAP.set( TimeControlSpeeds.FAST, { labelString: speedFastString, tandemName: 'fast' } );
  SPEED_LABEL_MAP.set( TimeControlSpeeds.NORMAL, { labelString: speedNormalString, tandemName: 'normal' } );
  SPEED_LABEL_MAP.set( TimeControlSpeeds.SLOW, { labelString: speedSlowString, tandemName: 'slow' } );

  class TimeControlNode extends Node {

    /**
     * @param {BooleanProperty} isPlayingProperty
     * @param {Object} [options]
     */
    constructor( isPlayingProperty, options ) {

      options = merge( {

        // REVIEW: Okay, this is a total nit, but the word wrapping on the comments below is very inconsistent.

        // {null|EnumerationProperty.<TimeControlSpeeds>} - Play speed Property for the
        // radio button group. If null, no radio buttons included in this control.
        timeControlSpeedProperty: null,

        // REVIEW: Did you mean to say "Vertical radio buttons for *are created* for each..."?
        // {TimeControlSpeeds[]} - Speeds supported by this TimeControlNode. Vertical radio buttons for
        // each in the order provided.
        timeControlSpeeds: DEFAULT_TIME_CONTROL_SPEEDS,

        // {boolean} - If true, the SpeedRadioButtonGroup will be to the left of the PlayPauseStepButtons, if a
        // SpeedRadioButtonGroup is included
        speedRadioButtonGroupOnLeft: false,

        // {number} - horizontal space between PlayPauseStepButtons and SpeedRadioButtonGroup, if
        // SpeedRadioButtonGroup is included
        buttonGroupXSpacing: 40,

        // {BooleanProperty}
        enabledProperty: null,

        // {Object|null} - options passed along to the PlayPauseStepButtons
        playPauseStepButtonOptions: null,

        // {Object|null} - options passed along to the SpeedRadioButtonGroup, if included
        speedRadioButtonGroupOptions: null,

        // {boolean} - if true, the SpeedRadioButtonGroup will be wrapped in a Panel
        wrapSpeedRadioButtonGroupInPanel: false,

        // {Object|null} - options passed to the panel wrapping SpeedRadioButtonGroup, if SpeedRadioButtonGroup
        // included AND we are wrapping them in a panel
        speedRadioButtonGroupPanelOptions: {
          xMargin: 8,
          yMargin: 6
        },

        // phet-io
        tandem: Tandem.REQUIRED, // {Tandem}

        // PDOM
        tagName: 'div',
        labelTagName: 'h3',
        labelContent: timeControlLabelString,
        descriptionContent: timeControlDescriptionString
      }, options );

      // REVIEW: Several lines below are substantially over the 120 char recommendation and are hard to read on my monitor.

      // options validation
      if ( options.timeControlSpeedProperty !== null ) {
        assert && assert( options.timeControlSpeeds.length > 1, 'must be at least two speed options' );
        assert && assert( _.every( options.timeControlSpeeds, speed => TimeControlSpeeds.includes( speed ) ), 'speeds must be one of TimeControlSpeeds' );
      }

      const playPauseStepButtons = new PlayPauseStepButtons( isPlayingProperty, options.tandem.createTandem( 'playPauseStepButtons' ), options.playPauseStepButtonOptions );
      const children = [ playPauseStepButtons ];

      let speedRadioButtonGroup = null;
      if ( options.timeControlSpeedProperty !== null ) {
        speedRadioButtonGroup = new SpeedRadioButtonGroup( options.timeControlSpeedProperty, options.timeControlSpeeds, options.tandem.createTandem( 'speedRadioButtonGroup' ), options.radioButtonGroupOptions );

        let child = speedRadioButtonGroup;
        if ( options.wrapSpeedRadioButtonGroupInPanel ) {
          child = new Panel( speedRadioButtonGroup, options.speedRadioButtonGroupPanelOptions );
        }
        options.speedRadioButtonGroupOnLeft ? children.unshift( child ) : children.push( child );

        assert && assert( children.length === 2, 'layout assumes only PlayPauseButtons and SpeedRadioButtonGroup children' );
        children[ 1 ].leftCenter = children[ 0 ].rightCenter.plusXY( options.buttonGroupXSpacing, 0 );
      }

      assert && assert( !options.children, 'TimeControlNode sets children' );
      options = merge( {
        children: children
      }, options );

      super( options );

      // @private {PlayPauseButton} - for layout
      this.playPauseStepButtons = playPauseStepButtons;

      // PDOM - this node's primary sibling is aria-labelledby its own label so the label content is read whenever
      // a member of the group receives focus
      this.addAriaLabelledbyAssociation( {
        thisElementName: AccessiblePeer.PRIMARY_SIBLING,
        otherNode: this,
        otherElementName: AccessiblePeer.LABEL_SIBLING
      } );

      // So we know whether we can dispose of the enabledProperty and its tandem
      const ownsEnabledProperty = !options.enabledProperty;

      // @public
      this.enabledProperty = options.enabledProperty || new BooleanProperty( true, {
        tandem: options.tandem.createTandem( 'enabledProperty' )
      } );

      const enabledListener = enabled => {
        this.pickable = enabled;
        this.opacity = enabled ? 1 : SunConstants.DISABLED_OPACITY;
      };
      this.enabledProperty.link( enabledListener );

      // @private
      this.disposeTimeControlNode = () => {
        playPauseStepButtons.dispose();
        speedRadioButtonGroup && speedRadioButtonGroup.dispose();

        if ( ownsEnabledProperty ) {
          this.enabledProperty.dispose();
        }
        else if ( this.enabledProperty.hasListener( enabledListener ) ) {
          this.enabledProperty.unlink( enabledListener );
        }
      };
    }

    /**
     * Get the center of the PlayPauseButton, in the local coordinate frame of the TimeControlNode. Useful if the
     * TimeControlNode needs to be positioned relative to the PlayPauseButton.
     * @public
     *
     * @returns {Vector2}
     */
    getPlayPauseButtonCenter() {
      return this.playPauseStepButtons.getPlayPauseButtonCenter();
    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.disposeTimeControlNode();
      super.dispose();
    }
  }

  // Possible play speeds for TimeControlNode
  // @public
  // @static
  TimeControlNode.TimeControlSpeeds = TimeControlSpeeds;

  /**
   * Inner type that collects the PlayPauseButton, StepForwardButton, and optionally the StepBackwardButton in
   * horizontal layout.
   */
  class PlayPauseStepButtons extends HBox {

    /**
     * @param {BooleanProperty} isPlayingProperty
     * @param {Tandem} tandem
     * @param {Obectj} [options]
     */
    constructor( isPlayingProperty, tandem, options ) {

      if ( options ) {
        if ( options.playPauseButtonOptions ) {
          assert && assert( !options.playPauseButtonOptions.tandem, 'TimeControlNode sets tandems for buttons' );
          assert && assert( !options.playPauseButtonOptions.phetioDocumentation, 'TimeControlNode sets phetioDocumentation' );
        }
        if ( options.stepForwardButtonOptions ) {
          assert && assert( !options.stepForwardButtonOptions.tandem, 'TimeControlNode sets tandems for buttons' );
          assert && assert( !options.playPauseButtonOptions.phetioDocumentation, 'TimeControlNode sets phetioDocumentation' );
        }
        if ( options.stepBackwardButtonOptions ) {
          assert && assert( !options.stepBackwardButtonOptions.tandem, 'TimeControlNode sets tandems for buttons' );
          assert && assert( !options.stepBackwardButtonOptions.phetioDocumentation, 'TimeControlNode sets phetioDocumentations' );
        }
      }

      // default options for step buttons
      // REVIEW: How about naming them defaultStepButtonOptions?
      const stepButtonOptions = {
        isPlayingProperty: isPlayingProperty,
        radius: 15,
        touchAreaDilation: 5
      };

      options = merge( {

        // {boolean} - if true, a StepBackwardButton is included in the button group
        includeStepBackwardButton: false,

        // {number} horizontal space between Play/Pause and Step buttons
        playPauseStepXSpacing: 10,

        // Options for the PlayPauseButton
        playPauseButtonOptions: {
          radius: 20,
          touchAreaDilation: 5,
          tandem: tandem.createTandem( 'playPauseButton' ),
          phetioDocumentation: 'Button to control the animation in the simulation. This will also stop the model from stepping.'
        },

        // Options for the StepBackwardButton
        stepBackwardButtonOptions: merge( {
          tandem: tandem.createTandem( 'stepForwardButton' ),
          phetioDocumentation: 'Progress the simulation a single model step forwards.'
        }, stepButtonOptions ),

        // Options for the StepForwardButton
        stepForwardButtonOptions: merge( {
          phetioDocumentation: 'Progress the simulation a single model step backwards.',
          tandem: tandem.createTandem( 'stepBackwardButton' )
        }, stepButtonOptions )
      }, options );

      const playPauseButton = new PlayPauseButton( isPlayingProperty, options.playPauseButtonOptions );
      const stepForwardButton = new StepForwardButton( options.stepForwardButtonOptions );

      const buttons = [ playPauseButton, stepForwardButton ];

      let stepBackwardButton = null;
      if ( options.includeStepBackwardButton ) {
        stepBackwardButton = new StepBackwardButton( options.stepBackwardButtonOptions );
        buttons.unshift( stepBackwardButton );
      }

      // Play/Pause and Step buttons
      super( {
        spacing: options.playPauseStepXSpacing,
        children: buttons,

        // don't change layout if playPauseButton resizes with scaleFactorWhenPaused
        resize: false
      } );

      // @private {PlayPauseButton} - for layout
      this.playPauseButton = playPauseButton;

      this.disposePlayPauseStepButtons = () => {
        playPauseButton.dispose();
        stepForwardButton.dispose();
        stepBackwardButton && stepBackwardButton.dispose();
      };
    }

    /**
     * Get the center of the PlayPauseButton, in the local coordinate frame of the PlayPauseStepButtons.
     * @public
     *
     * @returns {Vector2}
     */
    getPlayPauseButtonCenter() {
      return this.playPauseButton.center;
    }

    /**
     * Garbage collection.
     */
    dispose() {
      this.disposePlayPauseStepButtons();
      super.dispose();
    }
  }

  /**
   * Inner type for speed radio buttons.
   */
  class SpeedRadioButtonGroup extends VerticalAquaRadioButtonGroup {

    /**
     * @param {EnumerationProperty.<TimeControlSpeeds>} timeControlSpeedProperty
     * @param {TimeControlSpeeds[]} timeControlSpeeds - array of speeds to be included in this button group
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( timeControlSpeedProperty, timeControlSpeeds, tandem, options ) {
      options = merge( {

        // {Object} - options for the Normal/Slow text labels
        labelOptions: {
          font: new PhetFont( 14 )
        },

        // {Object|null} - options for the radio button group, defaults defined below because they are dependent on
        // size of label text
        radioButtonGroupOptions: null,

        // {Object|null} - options for individual radio buttons, defaults below because they are dependent on size of label
        // text
        radioButtonOptions: null
      }, options );

      const radioButtons = [];
      timeControlSpeeds.forEach( speed => {
        const speedLabel = SPEED_LABEL_MAP.get( speed );
        const labelNode = new Text( speedLabel.labelString, options.labelOptions );

        radioButtons.push( {
          value: speed,
          node: labelNode,
          labelContent:
          speedLabel.labelString,
          tandemName: SPEED_LABEL_MAP.get( speed ).tandemName
        } );
      } );

      const radioButtonOptions = merge( {
        xSpacing: 5,
        radius: radioButtons[ 0 ].node.height / 2.2
      }, options.radioButtonOptions );

      const radioButtonGroupOptions = merge( {
        radioButtonOptions: radioButtonOptions,
        spacing: 9,
        touchAreaDilation: 10,
        maxWidth: 150,
        tandem: tandem.createTandem( 'speedRadioButtonGroup' ),

        // PDOM
        labelTagName: 'h4',
        labelContent: simSpeedsString
      }, options.radioButtonGroupOptions );

      super( timeControlSpeedProperty, radioButtons, radioButtonGroupOptions );

      // PDOM - so that the RadioButtonGroup label is read any time a RadioButton gets focus
      this.addAriaLabelledbyAssociation( {
        thisElementName: AccessiblePeer.PRIMARY_SIBLING,
        otherNode: this,
        otherElementName: AccessiblePeer.LABEL_SIBLING
      } );
    }
  }

  return sceneryPhet.register( 'TimeControlNode', TimeControlNode );
} );
