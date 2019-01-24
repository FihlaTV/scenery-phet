// Copyright 2017-2018, University of Colorado Boulder

/**
 * Content for a KeyboardHelpDialog that describes how to use sliders.
 *
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var EndKeyNode = require( 'SCENERY_PHET/keyboard/EndKeyNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HelpContent = require( 'SCENERY_PHET/keyboard/help/HelpContent' );
  var HomeKeyNode = require( 'SCENERY_PHET/keyboard/HomeKeyNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PageDownKeyNode = require( 'SCENERY_PHET/keyboard/PageDownKeyNode' );
  var PageUpKeyNode = require( 'SCENERY_PHET/keyboard/PageUpKeyNode' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );

  // strings
  var keyboardHelpDialogAdjustInLargerStepsString = require( 'string!SCENERY_PHET/keyboardHelpDialog.adjustInLargerSteps' );
  var keyboardHelpDialogAdjustInSmallerStepsString = require( 'string!SCENERY_PHET/keyboardHelpDialog.adjustInSmallerSteps' );
  var keyboardHelpDialogAdjustSliderString = require( 'string!SCENERY_PHET/keyboardHelpDialog.adjustSlider' );
  var keyboardHelpDialogJumpToMaximumString = require( 'string!SCENERY_PHET/keyboardHelpDialog.jumpToMaximum' );
  var keyboardHelpDialogJumpToMinimumString = require( 'string!SCENERY_PHET/keyboardHelpDialog.jumpToMinimum' );
  var keyboardHelpDialogSliderControlsString = require( 'string!SCENERY_PHET/keyboardHelpDialog.sliderControls' );

  // a11y strings
  var keyboardHelpDialogAdjustLargerStepsString = SceneryPhetA11yStrings.keyboardHelpDialogAdjustLargerStepsString.value;
  var keyboardHelpDialogJumpToHomeString = SceneryPhetA11yStrings.keyboardHelpDialogJumpToHomeString.value;
  var keyboardHelpDialogJumpToEndString = SceneryPhetA11yStrings.keyboardHelpDialogJumpToEndString.value;
  var keyboardHelpDialogAdjustDefaultStepsString = SceneryPhetA11yStrings.keyboardHelpDialogAdjustDefaultStepsString.value;
  var keyboardHelpDialogAdjustSmallerStepsString = SceneryPhetA11yStrings.keyboardHelpDialogAdjustSmallerStepsString.value;

  // constants
  var DEFAULT_LABEL_OPTIONS = {
    font: HelpContent.DEFAULT_LABEL_FONT
  };

  /**
   * @constructor
   * @param {Object} options
   */
  function SliderControlsHelpContent( options ) {

    options = _.extend( {

      // heading string for this content
      headingString: keyboardHelpDialogSliderControlsString,

      // options passed to the label Text
      labelOptions: null
    }, options );

    options.labelOptions = _.extend( DEFAULT_LABEL_OPTIONS, options.labelOptions );

    // 'Move sliders' content
    var adjustSliderLeftRightIcon = HelpContent.leftRightArrowKeysRowIcon();
    var adjustSliderUpDownIcon = HelpContent.upDownArrowKeysRowIcon();
    var adjustSliderIcon = HelpContent.iconOrIcon( adjustSliderLeftRightIcon, adjustSliderUpDownIcon );
    var adjustSliderRow = HelpContent.labelWithIcon( keyboardHelpDialogAdjustSliderString, adjustSliderIcon, keyboardHelpDialogAdjustDefaultStepsString );

    // 'move in smaller steps' content
    var smallStepsLeftRightIcon = HelpContent.leftRightArrowKeysRowIcon();
    var smallStepsUpDownIcon = HelpContent.upDownArrowKeysRowIcon();

    var shiftPlusLeftRightIcon = HelpContent.shiftPlusIcon( smallStepsLeftRightIcon );
    var shiftPlusUpDownIcon = HelpContent.shiftPlusIcon( smallStepsUpDownIcon );

    var adjustSliderInSmallerStepsRow = HelpContent.labelWithIconList( keyboardHelpDialogAdjustInSmallerStepsString, [ shiftPlusLeftRightIcon, shiftPlusUpDownIcon ], keyboardHelpDialogAdjustSmallerStepsString );

    // 'move in larger steps' content
    var pageUpKeyNode = new PageUpKeyNode();
    var pageDownKeyNode = new PageDownKeyNode();
    var pageUpPageDownIcon = new HBox( {
      children: [ pageUpKeyNode, pageDownKeyNode ],
      spacing: HelpContent.DEFAULT_ICON_SPACING
    } );
    var adjustInLargerStepsRow = HelpContent.labelWithIcon( keyboardHelpDialogAdjustInLargerStepsString, pageUpPageDownIcon, keyboardHelpDialogAdjustLargerStepsString );

    // 'move to minimum value' content
    var homeKeyNode = new HomeKeyNode();
    var jumpToMinimumRow = HelpContent.labelWithIcon( keyboardHelpDialogJumpToMinimumString, homeKeyNode, keyboardHelpDialogJumpToHomeString );

    // 'move to maximum value' content
    var endKeyNode = new EndKeyNode();
    var jumpToMaximumRow = HelpContent.labelWithIcon( keyboardHelpDialogJumpToMaximumString, endKeyNode, keyboardHelpDialogJumpToEndString );

    // assemble final content for HelpContent
    var content = [ adjustSliderRow, adjustSliderInSmallerStepsRow, adjustInLargerStepsRow, jumpToMinimumRow, jumpToMaximumRow ];

    HelpContent.call( this, options.headingString, content, options );
  }

  sceneryPhet.register( 'SliderControlsHelpContent', SliderControlsHelpContent );

  return inherit( HelpContent, SliderControlsHelpContent );
} );
