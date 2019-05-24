// Copyright 2019, University of Colorado Boulder

/*
 * IMPORTANT: This file was auto-generated by "grunt generate-config". Please do not modify this directly. Instead
 * please modify scenery-phet/package.json to control dependencies.
 *
 * RequireJS configuration file for the scenery-phet sim.
 * Paths are relative to the location of this file.
 */

require.config( {

  deps: [ 'scenery-phet-main' ],

  paths: {

    // Third-party libs
    text: '../../sherpa/lib/text-2.0.12',

    // PhET plugins
    sound: '../../chipper/js/requirejs-plugins/sound',
    image: '../../chipper/js/requirejs-plugins/image',
    mipmap: '../../chipper/js/requirejs-plugins/mipmap',
    string: '../../chipper/js/requirejs-plugins/string',
    ifphetio: '../../chipper/js/requirejs-plugins/ifphetio',

    // PhET libs, uppercase names to identify them in require.js imports.
    // IMPORTANT: DO NOT modify. This file is auto-generated. See documentation at the top.
    AXON: '../../axon/js',
    BRAND: '../../brand/' + phet.chipper.brand + '/js',
    DOT: '../../dot/js',
    JOIST: '../../joist/js',
    KITE: '../../kite/js',
    PHETCOMMON: '../../phetcommon/js',
    PHET_CORE: '../../phet-core/js',
    PHET_IO: '../../phet-io/js',
    REPOSITORY: '..',
    SCENERY: '../../scenery/js',
    SCENERY_PHET: '.',
    SUN: '../../sun/js',
    TAMBO: '../../tambo/js',
    TANDEM: '../../tandem/js',
    TWIXT: '../../twixt/js'
  },

  // optional cache bust to make browser refresh load all included scripts, can be disabled with ?cacheBust=false
  urlArgs: phet.chipper.getCacheBustArgs()
} );
