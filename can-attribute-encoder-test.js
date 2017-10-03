var QUnit = require('steal-qunit');
var encoder = require('./can-attribute-encoder');
var clone = require('steal-clone');
var dev = require('can-log/dev/dev');

QUnit.test('encoding / decoding', function() {
	var encoded,
		encodings = {
		'on:fooBar': 'on:foo:u:bar',
		'on:fooBar:by:bazQuz': 'on:foo:u:bar:by:baz:u:quz',
		'fooBar:to': 'foo:u:bar:to',
		'fooBar:from': 'foo:u:bar:from',
		'fooBar:bind': 'foo:u:bar:bind',
		'(foo bar)': ':lp:foo:s:bar:rp:',
		'(foo/bar)': ':lp:foo:f:bar:rp:',
		'{foo bar}': ':lb:foo:s:bar:rb:',
		'{foo/bar}': ':lb:foo:f:bar:rb:',
		'{$^foobar}': ':lb::d::c:foobar:rb:',
		'{^@bar}': ':lb::c::at:bar:rb:'
	};

	for (var key in encodings) {
		encoded = encoder.encode(key);

		QUnit.equal(encoded, encodings[key], 'encoding');
		QUnit.equal(encoder.decode(encoded), key, 'decoding');
	}
});

QUnit.test('encoded values should work with setAttribute', function() {
	var div = document.createElement('div'),
		attributes = [
			'on:fooBar',
			'on:fooBar:by:bazQuz',
			'fooBar:to',
			'fooBar:from',
			'fooBar:bind',
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

