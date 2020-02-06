// Copyright 2018-2020, University of Colorado Boulder

/**
 *
 * A node that creates a "Play Area" accessible section in the PDOM. This organizational Node should have accessible
 * content to be displayed under it in the PDOM. This content can be added as a child, or added via `accessibleOrder`.
 * Items in this section are designed to be the "main interaction and pedagogical learning" to be had for the screen.
 * See ScreenView for more documentation and usage explanation.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

define( require => {
  'use strict';

  // modules
  const AccessibleSectionNode = require( 'SCENERY_PHET/accessibility/AccessibleSectionNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  const SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );

  // A11y strings
  const playAreaString = SceneryPhetA11yStrings.playArea.value;

  /**
   * @constructor
   * @param {Object} [options]
   */
  function PlayAreaNode( options ) {
    AccessibleSectionNode.call( this, playAreaString, options );
  }

  sceneryPhet.register( 'PlayAreaNode', PlayAreaNode );

  return inherit( AccessibleSectionNode, PlayAreaNode );
} );
