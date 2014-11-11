suite('parentrunner', function() {
  var PassThrough = require('stream').PassThrough;

  var sinon;
  setup(function() {
    sinon = global.sinon.sandbox.create();
  });

  teardown(function() {
    sinon.restore();
  });

  var subject;
  var Parent =
    require('../lib/parentrunner').ParentRunner;

  suite('initialization', function() {
    var argv = [];
    setup(function() {
      subject = new Parent(argv);
    });

    test('.argv', function() {
      assert.equal(subject.argv, argv);
    });
  });

  suite('#run', function() {
    var childrunner = require('../lib/childrunner');
    var profileBase = {};

    function Reporter() {}
    function Host() {}
    function ProfileBuilder() {}

    function MockChild(options) {
      this.options = options;
      this.process = {};
      this.runner = {};

      this.spawn = (function() {
        this.calledSpawn = true;
      }.bind(this));
    }

    var result;
    setup(function() {
      sinon.stub(childrunner, 'ChildRunner', MockChild);

      result = subject.run({
        host: { constructor: Host },
        reporter: { constructor: Reporter },
        profileBuilder: { constructor: ProfileBuilder },
        profileBase: profileBase,
        hostLog: new PassThrough()
      });
    });

    test('reporter', function() {
      assert.ok(result instanceof Reporter);
    });

    test('invokes child', function() {
      assert.equal(subject.children.length, 1);
    });

    test('spawns child', function() {
      assert.ok(subject.children[0].calledSpawn);
    });
  });

});
