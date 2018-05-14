var QUnit = require('steal-qunit');
var encoder = require('./can-attribute-encoder');
var clone = require('steal-clone');
var dev = require('can-log/dev/dev');

QUnit.test('encoding / decoding', function() {
	var encoded,
		encodings = {
		// bound
		'on:fooBar': 'on:foo:u:bar',
		'on:fooBar:by:bazQuz': 'on:foo:u:bar:by:baz:u:quz',
		'vm:sProp:to': 'vm:s:u:prop:to',
		'fooBar:to': 'foo:u:bar:to',
		'FooBar:to': ':u:foo:u:bar:to',
		'Foobar:to': ':u:foobar:to',
		'fooBar:from': 'foo:u:bar:from',
		'fooBar:bind': 'foo:u:bar:bind',

		// not bound
		'DISABLED': 'DISABLED',
		'fooBar': 'fooBar',
		'FooBar': 'FooBar',
		'fooBar:raw': 'foo:u:bar:raw',

		// legacy
		'(foo bar)': ':lp:foo:s:bar:rp:',
		'(foo/bar)': ':lp:foo:f:bar:rp:',
		'{foo bar}': ':lb:foo:s:bar:rb:',
		'{foo/bar}': ':lb:foo:f:bar:rb:',
		'{$^foobar}': ':lb::d::c:foobar:rb:',
		'{^@bar}': ':lb::c::at:bar:rb:'
	};

	for (var key in encodings) {
		encoded = encoder.encode(key);

		QUnit.equal(encoded, encodings[key], 'encoding ' + key);
		QUnit.equal(encoder.decode(encoded), key, 'decoding ' + encoded);
	}
});

QUnit.test('encoded values should work with setAttribute', function() {
	var div = document.createElement('div'),
		attributes = [
			// bound
			'on:fooBar',
			'on:fooBar:by:bazQuz',
			'vm:sProp:to',
			'fooBar:to',
			'FooBar:to',
			'Foobar:to',
			'fooBar:from',
			'fooBar:bind',

			// not bound
			'DISABLED',
			'fooBar',
			'FooBar',
			'fooBar:raw',

			// legacy
			'(foo bar)',
			'(foo/bar)',
			'{foo bar}',
			'{foo/bar}',
			'{$^foobar}',
			'{^@foo}'
		];

	attributes.forEach(function(attr) {
		try {
			div.setAttribute(encoder.encode(attr), attr + 'val');
			QUnit.ok(true, attr + ' worked');
		} catch(e) {
			QUnit.ok(false, e);
		}
	});
});

QUnit.test('should warn and convert camelCase props in old bindings', function() {
	expect(2);

	var origWarn = dev.warn;
	dev.warn = function(warning) {
		QUnit.ok(warning.indexOf("Found attribute with name: {fooBar}. Converting to: {foo-bar}.") >= 0, 'correct warning given');
	};

	var encoded = encoder.encode('{fooBar}');
	QUnit.equal(encoded, ':lb:foo-bar:rb:', 'encoded correctly');

	dev.warn = origWarn;
});

QUnit.test('should throw if can-namespace.encoder is already defined', function() {
	stop();
	clone({
		'can-namespace': {
			default: {
				encoder: {
				}
			},
			__useDefault: true
		}
	})
	.import('can-attribute-encoder')
	.then(function() {
		ok(false, 'should throw');
		start();
	})
	.catch(function(err) {
		var errMsg = err && err.message || err;
		ok(errMsg.indexOf('can-attribute-encoder') >= 0, 'should throw an error about can-attribute-encoder');
		start();
	});
});
