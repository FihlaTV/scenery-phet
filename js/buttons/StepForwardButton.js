// Copyright 2016-2019, University of Colorado Boulder

/**
 * Step forward button.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var commonSoundPlayers = require( 'TAMBO/commonSoundPlayers' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function StepForwardButton( options ) {

    options = _.extend( {
      soundPlayer: commonSoundPlayers.stepForwardButtonSoundPlayer
    }, options );

    assert && assert( !options.direction, 'StepForwardButton sets direction' );
    options.direction = 'forward';

    StepButton.call( this, options );
  }

  sceneryPhet.register( 'StepForwardButton', StepForwardButton );

  return inherit( StepButton, StepForwardButton );
} );
