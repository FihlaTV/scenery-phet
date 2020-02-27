// Copyright 2016-2019, University of Colorado Boulder

/**
 * Button for toggling 'recording' state on/off.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import BooleanRoundToggleButton from '../../../sun/js/buttons/BooleanRoundToggleButton.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';

/**
 * @param {Property.<boolean>} recordingProperty - true: recording, false: not recording
 * @param {Object} [options] node options
 * @constructor
 */
function RecordStopButton( recordingProperty, options ) {
  options = merge( {
    radius: 30
  }, options );

  const squareLength = 0.75 * options.radius;

  // stop icon, a black square
  const stopIcon = new Rectangle( 0, 0, 0.75 * options.radius, 0.75 * options.radius, { fill: 'black' } );

  // record icon, a red circle
  const recordIcon = new Circle( 0.6 * squareLength, {
    fill: PhetColorScheme.RED_COLORBLIND,
    center: stopIcon.center
  } );

  BooleanRoundToggleButton.call( this, stopIcon, recordIcon, recordingProperty, options );

  // support for binder documentation, stripped out in builds and only runs when ?binder is specified
  assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'RecordStopButton', this );
}

sceneryPhet.register( 'RecordStopButton', RecordStopButton );

inherit( BooleanRoundToggleButton, RecordStopButton );
export default RecordStopButton;