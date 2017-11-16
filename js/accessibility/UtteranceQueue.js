// Copyright 2017, University of Colorado Boulder

/**
 * Manages a queue of Utterances that are read in order by a screen reader.  This queue typically reads
 * things in a first-in-first-out manner, but it is possible to send an alert directly to the front of
 * the queue.  Items in the queue are sent to the screen reader front to back with a certain delay.
 *
 * Screen readers are inconsistent in the way that they order alerts, some use last-in-first-out order,
 * others use first-in-first-out order, others just read the last alert that was provided. This queue
 * manages order and improves consistency.
 *
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var AriaHerald = require( 'SCENERY_PHET/accessibility/AriaHerald' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Timer = require( 'PHET_CORE/Timer' );
  var UtteranceQueueIO = require( 'SCENERY_PHET/accessibility/UtteranceQueueIO' );
  var Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );

  // phet-io modules
  var phetioEvents = require( 'ifphetio!PHET_IO/phetioEvents' );

  // {Tandem} - phet-io support
  var tandem = Tandem.createStaticTandem( 'utteranceQueue' );

  // {Utterance} - array of utterances, spoken in first to last order
  var queue = [];

  // the interval for sending alerts to the screen reader, in milliseconds
  var interval = 500;

  // whether or not Utterances moving through the queue are read by a screen reader
  var muted = false;

  // whether the UtterancesQueue is alerting, and if you can add/remove utterances
  var enabled = true;

  var UtteranceQueue = {

    /**
     * Add an utterance ot the end of the queue.  If the utterance has a type of alert which
     * is already in the queue, the older alert will be immediately removed.
     *
     * @public
     * @param {Utterance|string} utterance
     */
    addToBack: function( utterance ) {
      assert && assert( utterance instanceof Utterance || typeof utterance === 'string',
        'utterance queue only supports string or type Utterance.' );

      // No-op function if the UtteranceQueue is disabled
      if ( !enabled ) {
        return;
      }

      if ( typeof utterance === 'string' ) {
        utterance = new Utterance( utterance );
      }

      // if there are any other items in the queue of the same type, remove them immediately
      // because the new utterance is meant to replace them
      if ( utterance.typeId ) {
        for ( var i = queue.length - 1; i >= 0; i-- ) {
          var otherUtterance = queue[ i ];
          if ( otherUtterance.typeId === utterance.typeId ) {
            queue.splice( i, 1 );
          }
        }
      }

      queue.push( utterance );
    },

    /**
     * Add an utterance to the front of the queue to be read immediately.
     * @param {Utterance|string} utterance
     */
    addToFront: function( utterance ) {
      assert && assert( utterance instanceof Utterance || typeof utterance === 'string',
        'utterance queue only supports string or type Utterance.' );

      // No-op function if the UtteranceQueue is disabled
      if ( !enabled ) {
        return;
      }

      if ( typeof utterance === 'string' ) {
        utterance = new Utterance( utterance );
      }
      queue.unshift( utterance );
    },

    /**
     * Move to the next item in the queue. Checks the Utterance predicate first, if predicate
     * returns false, no alert will be read. Called privately by Timer.setInterval
     *
     * @private
     */
    next: function() {

      // get and remove the next item from the queue
      var nextUtterance = queue.shift();

      // only speak the utterance if the Utterance predicate returns true
      if ( nextUtterance && !muted && nextUtterance.predicate() ) {

        // phet-io event to the data stream
        var id = phetioEvents.start( 'model', tandem.id, UtteranceQueueIO, 'announced', { utterance: nextUtterance.text } );

        // Pass the utterance text on to be set in the PDOM.
        AriaHerald.announcePolite( nextUtterance.text );

        phetioEvents.end( id );
      }
    },

    /**
     * Clear the UtteranceQueue of all Utterances, any Utterances remaining in the queue will
     * not be announced by the screen reader.
     *
     * @public
     */
    clear: function() {
      queue = [];
    },

    /**
     * Set whether or not the utterance queue is muted.  When muted, Utterances will still
     * move through the queue, but nothing will be sent to assistive technology.
     *
     * @param {boolean} isMuted
     */
    setMuted: function( isMuted ) {
      muted = isMuted;
    },
    set muted( isMuted ) { this.setMuted( isMuted ); },

    /**
     * Get whether or not the UtteranceQueue is muted.  When muted, Utterances will still
     * move through the queue, but nothing will be read by asistive technology.
     * @public
     */
    getMuted: function() {
      return muted;
    },
    get muted() { return this.getMuted(); },


    /**
     * Set whether or not the utterance queue is enabled.  When enabled, Utterances cannot be added to
     * the queue, and the Queue cannot be cleared. Also nothing will be sent to assistive technology.
     *
     * @param {boolean} isEnabled
     */
    setEnabled: function( isEnabled ) {
      enabled = isEnabled;
    },
    set enabled( isEnabled ) { this.setEnabled( isEnabled ); },

    /**
     * Get whether or not the utterance queue is enabled.  When enabled, Utterances cannot be added to
     * the queue, and the Queue cannot be cleared. Also nothing will be sent to assistive technology.
     * @public
     */
    getEnabled: function() {
      return enabled;
    },
    get enabled() { return this.getEnabled(); },


    /**
     * Get the interval that alerts are sent to the screen reader.
     *
     * @public
     * @return {number}
     */
    getInterval: function() {
      return interval;
    },
    get interval() { return this.getInterval(); },

    /**
     * Set the alert interval in milliseconds
     * @public
     * @param {number} alertInterval
     */
    setInterval: function( alertInterval ) {
      interval = alertInterval;
    },
    set interval( alertInterval ) { this.setInterval( alertInterval ); }
  };

  sceneryPhet.register( 'UtteranceQueue', UtteranceQueue );

  // step the alert queue
  Timer.setInterval( function() {

      // No-op function if the UtteranceQueue is disabled
      if ( !enabled ) {
        return;
      }

      UtteranceQueue.next();
    }, UtteranceQueue.interval
  );

  tandem.addInstance( UtteranceQueue, { phetioType: UtteranceQueueIO } );

  return UtteranceQueue;
} );
