// Copyright 2017, University of Colorado Boulder

/**
 * QUnit tests for Utterance and utteranceQueue
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AriaHerald = require( 'SCENERY_PHET/accessibility/AriaHerald' );
  const timer = require( 'PHET_CORE/timer' );
  const Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  var sleepTiming = null;

  // helper es6 functions from  https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout/33292942
  function timeout( ms ) {
    return new Promise( resolve => setTimeout( resolve, ms ) );
  }

  async function sleep( fn, ...args ) {

    assert && assert( typeof sleepTiming === 'number' && sleepTiming > 0 );
    await timeout( sleepTiming );
    return fn( ...args );
  }

  var alerts = [];


  var intervalID = null;
  QUnit.module( 'Utterance', {
    before: () => {

      // step the timer, because utteranceQueue runs on timer
      intervalID = setInterval( () => {
        timer.emit1( 1 );
      }, 1 );

      // keep track of all alerts being put on aria live elements so we can test against them.
      AriaHerald.initialize( text => {
        alerts.unshift( text );
      } );

      // initialize the queue
      utteranceQueue.initialize();

      // slightly slower than the interval that the utteranceQueue will wait so we don't have a race condition
      sleepTiming = utteranceQueue.interval + 10;
    },
    beforeEach: () => { alerts = []; }, // clear the alerts before each new test
    after: () => {
      clearInterval( intervalID );
    }
  } );


  QUnit.test( 'Utterance(Queue) Testing', async assert => {

    assert.ok( true, 'first test' );

    let alert = 'hi';
    utteranceQueue.addToBack( alert );


    await sleep( () => {
      assert.ok( alerts[ 0 ] === alert, 'basic utteranceQueue test' );
    } );

    utteranceQueue.addToBack( 'alert' );
    await sleep( () => {
      assert.ok( alerts[ 0 ] === 'alert', 'basic utteranceQueue test2' );
    } );
  } );

  QUnit.test( 'Utterance options', async assert => {

    var alert = new Utterance( {
      alert: [ '1', '2', '3' ]
    } );

    let alert4 = () => {
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
    };

    let testOrder = ( messageSuffix ) => {

      // newest at lowest index
      assert.ok( alerts[ 3 ] === '1', 'Array order1' + messageSuffix );
      assert.ok( alerts[ 2 ] === '2', 'Array order2' + messageSuffix );
      assert.ok( alerts[ 1 ] === '3', 'Array order3' + messageSuffix );
      assert.ok( alerts[ 0 ] === '3', 'Array order4' + messageSuffix );
    };

    alert4();
    await timeout( sleepTiming * 4 );
    testOrder( '' );
    alert.reset();
    alert4();
    testOrder( ', reset should start over' );
  } );


  QUnit.test( 'Utterance loopAlerts', async assert => {

    var alert = new Utterance( {
      alert: [ '1', '2', '3' ],
      loopAlerts: true
    } );

    let alert7 = () => {
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
      utteranceQueue.addToBack( alert );
    };

    let testOrder = ( messageSuffix ) => {

      // newest at lowest index
      assert.ok( alerts[ 6 ] === '1', 'Array order1' + messageSuffix );
      assert.ok( alerts[ 5 ] === '2', 'Array order2' + messageSuffix );
      assert.ok( alerts[ 4 ] === '3', 'Array order3' + messageSuffix );
      assert.ok( alerts[ 3 ] === '1', 'Array order4' + messageSuffix );
      assert.ok( alerts[ 2 ] === '2', 'Array order5' + messageSuffix );
      assert.ok( alerts[ 1 ] === '3', 'Array order6' + messageSuffix );
      assert.ok( alerts[ 0 ] === '1', 'Array order7' + messageSuffix );
    };

    alert7();
    await timeout( sleepTiming * 7 );
    testOrder( '' );
    alert.reset();
    alert7();
    testOrder( ', reset should start over' );
  } );
} );