/**
Custom marionette-runner interface for mocha.
*/

/**
 * Module dependencies.
 */

var Suite = require('mocha/lib/suite'),
    HostManager = require('./runtime/hostmanager').HostManager,
    Test = require('mocha/lib/test'),
    escapeRe = require('escape-string-regexp'),
    utils = require('mocha/lib/utils');

/**
@param {Object} suite root suite for mocha.
*/
module.exports = function(suite) {
  var suites = [suite];
  var manager = new HostManager();

  suite.on('pre-require', function(context, file, mocha) {
    /**
     * Execute before each test case.
     */
    context.setup = function(name, fn) {
      suites[0].beforeEach(name, fn);
    };

    /**
     * Execute after each test case.
     */
    context.teardown = function(name, fn) {
      suites[0].afterEach(name, fn);
    };

    /**
     * Execute before the suite.
     */
    context.suiteSetup = function(name, fn) {
      suites[0].beforeAll(name, fn);
    };

    /**
     * Execute after the suite.
     */
    context.suiteTeardown = function(name, fn) {
      suites[0].afterAll(name, fn);
    };

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */
    context.suite = function(title, fn) {
      var suite = Suite.create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
      return suite;
    };

    context.marionette = context.suite;

    /**
     * global state modifies for marionette
     *
     * @type {Object}
     */
    // Setup global state manager for the marionette runtime.
    context.marionette._manager = manager;
    context.marionette.client = manager.createHost.bind(manager);
    context.marionette.plugin = manager.addPlugin.bind(manager);

    /**
     * Pending suite.
     */
    context.suite.skip = function(title, fn) {
      var suite = Suite.create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive test-case.
     */
    context.suite.only = function(title, fn) {
      var suite = context.suite(title, fn);
      mocha.grep(suite.fullTitle());
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */
    context.test = function(title, fn) {
      var suite = suites[0];
      if (suite.pending) var fn = null;
      var test = new Test(title, fn);
      test.file = file;
      suite.addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */
    context.test.only = function(title, fn) {
      var test = context.test(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
    };

    /**
     * Pending test case.
     */
    context.test.skip = function(title) {
      context.test(title);
    };
  });
};

