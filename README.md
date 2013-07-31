marionette-js-runner
====================

This project is the sum of a number of other smaller more focused projects:
  - [marionette-js-client](https://github.com/mozilla-b2g/marionette_js_client)
  - [marionette-profile-builder](https://github.com/mozilla-b2g/marionette-profile-builder)
  - [marionette-b2gdesktop-host](https://github.com/mozilla-b2g/marionette-b2gdesktop-host)

See [MDN](https://developer.mozilla.org/en-US/docs/Marionette/Marionette_JavaScript_Tools) 
for more details about the intent of the project and where its going.

## Installing / Invoking tests


add marionette-js-runner and marionette-js-client to your project

```json
{
  "devDependencies": {
    "marionette-client": "...",
    "marionette-js-runner": "..."
  }
}
```

Invoke a marionette-mocha test

```sh
# from the root of your project (where your package.json is)
./node_modules/.bin/marionette-mocha path/to/test.js
```

See `marionette-mocha --help` for more docs on what it can do.

## Exposed APIs for wirting marionette tests

## `marionette` (suite/describe like a api)

The marionette function is a wrapper around mocha's suite/describe blocks.
They expose an additional field (a filter) which is an object which describes under which 
conditions a test may execute. 

The filter is matched vs metadata from the particular host (like firefox / b2g-desktop ) the test is running on.
[Example host metdata](https://github.com/mozilla-b2g/marionette-b2gdesktop-host/blob/105552c46f0e384627bce19b242f2de94e06c633/index.js#L33)

```js
// this always runs
marionette('I always run', function() {
});

// only runs on firefox
marionette('firefox only', { host: 'firefox' }, function() {
  test('only executed when host is firefox');
});

// executed when firefox is the host OR b2g-desktop
marionette('b2g desktop or firefox', { host: ['firefox', 'b2g-desktop'] }, function() {
  
});
```

## `marionette.client` (creates a marionette client interface)

Creating a client is easy. Each test will run in a completely clean state ( with its own profile ).
The default client has no profile options and is sync.

```js
marionette('github.com', function() {
  var github = 'http://github.com';
  
  // no options are required by default.
  var client = marionette.client();
  
  setup(function() {
    client.goUrl(github);
  });
  
  test('logging into github', function() {
    // do stuff with the client
  });
})
```

Clients can be configured to have custom profiles (lets say you want a custom app, change a setting, etc..)

```js
marionette('my custom app', function() {
  var client = marionette.client({
    // see for options https://github.com/mozilla-b2g/mozilla-profile-builder
    prefs: { 
      // see about:config too
      'devtools.inspector.markupPreview': true
    },
    settings: { 
      // turn off lockscreen
      "lockscreen.locked": false 
    },
    
    // install a packaged app
    apps: {
      'domain-name-of-my-amazing-app.com': '/path/to/app'      
    }
  });
  
  // ... do stuff with your client
})
```

Client have different "driver" types which determine how they connect with the marionette server.
Typically you don't need to think about this but it is important to note that the default driver is synchronous
which means each marionette operation blocks (you can't really run servers in the same process).

```js
marionette('be async man', function() {
  var client = marionette.client({}, require('marionette-client').Drivers.Tcp);
  
  // imagine this is used to create an http server in this process
  var http = require('http');

  
  test('talk to the server in this process', function(done) {
    client.goUrl('http://localhost:port', function(err) {
      if (err) return done(err);
      
      // perform some other actions..
      done();
    });
  });
})
```

Finally you can also create multiple clients.

```js
marionette('I like sending emails to msyelf', function() {
  var clientA = marionette.client();
  var clientB = marionette.client();
  
  // do something fancy like send an email from one client to another
});
```
