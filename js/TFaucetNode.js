// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  /**
   * Wrapper type for phet/sun's Faucet class.
   * @param faucet
   * @param phetioID
   * @constructor
   */
  function TFaucetNode( faucet, phetioID ) {
    assert && assertInstanceOf( faucet, phet.sceneryPhet.FaucetNode );
    NodeIO.call( this, faucet, phetioID );
  }

  phetioInherit( NodeIO, 'TFaucetNode', TFaucetNode, {}, {
    documentation: 'Faucet that emits fluid, typically user-controllable',
    events: [ 'startTapToDispense', 'endTapToDispense' ]
  } );

  sceneryPhet.register( 'TFaucetNode', TFaucetNode );

  return TFaucetNode;
} );

