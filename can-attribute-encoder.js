var namespace = require('can-namespace');

/**
 * @module {{}} can-attribute-encoder can-attribute-encoder
 * @parent can-dom-utilities
 * @collection can-infrastructure
 * @package ./package.json
 *
 * Encode and decode attribute names.
 *
 * @option {Object} An object with the methods:
 * [can-attribute-encoder.encode] and [can-attribute-encoder.decode].
 *
 */


function each(items, callback){
	for ( var i = 0; i < items.length; i++ ) {
		callback(items[i], i);
	}
}

function makeMap(str){
	var obj = {}, items = str.split(",");
	each(items, function(name){
		obj[name] = true;
	});
	return obj;
}

// Attributes for which the case matters - shouldn’t be lowercased.
var caseMattersAttributes = makeMap("allowReorder,attributeName,attributeType,autoReverse,baseFrequency,baseProfile,calcMode,clipPathUnits,contentScriptType,contentStyleType,diffuseConstant,edgeMode,externalResourcesRequired,filterRes,filterUnits,glyphRef,gradientTransform,gradientUnits,kernelMatrix,kernelUnitLength,keyPoints,keySplines,keyTimes,lengthAdjust,limitingConeAngle,markerHeight,markerUnits,markerWidth,maskContentUnits,maskUnits,patternContentUnits,patternTransform,patternUnits,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,repeatCount,repeatDur,requiredExtensions,requiredFeatures,specularConstant,specularExponent,spreadMethod,startOffset,stdDeviation,stitchTiles,surfaceScale,systemLanguage,tableValues,textLength,viewBox,viewTarget,xChannelSelector,yChannelSelector");

function startsWith(allOfIt, startsWith) {
	return allOfIt.indexOf(startsWith) === 0;
}

function endsWith(allOfIt, endsWith) {
	return (allOfIt.length - allOfIt.indexOf(endsWith)) === endsWith.length;
}

var regexes = {
	camelCase: /([a-z]|^)([A-Z])/g,
	uppercase: /[A-Z]/g,
	uppercaseDelimiterThenChar: /:u:([a-z])/g,
};

var delimiters = {
	prependUppercase: ':u:',
};

var encoder = {};

/**
 * @function can-attribute-encoder.encode encode
 * @parent can-attribute-encoder
 * @description Encode an attribute name
 *
 * @signature `encoder.encode(attributeName)`
 *
 * Note: specific encoding may change, but encoded attributes
 * can always be decoded using [can-attribute-encoder.decode].
 *
 * @body
 *
 * ```js
 * var encodedAttributeName = encoder.encode("{(^$foo/bar baz)}");
 * div.setAttribute(encodedAttributeName, "attribute value");
 * ```
 *
 * @param {String} attributeName The attribute name.
 * @return {String} The encoded attribute name.
 *
 */
encoder.encode = function(name) {
	var encoded = name;

	// encode or convert camelCase attributes unless in list of attributes
	// where case matters
	if (!caseMattersAttributes[encoded] && encoded.match(regexes.camelCase)) {
		// encode uppercase characters in new bindings
		// - on:fooBar, fooBar:to, fooBar:from, fooBar:bind
		if (startsWith(encoded, 'on:') || endsWith(encoded, ':to') || endsWith(encoded, ':from') || endsWith(encoded, ':bind')) {
			encoded = encoded
				.replace(regexes.uppercase, function(char) {
					return delimiters.prependUppercase + char.toLowerCase();
				});
		}
	}

	return encoded;
};

/**
 * @function can-attribute-encoder.decode decode
 * @parent can-attribute-encoder
 * @description Decode an attribute name encoded by [can-attribute-encoder.encode]
 * @signature `encoder.decode(attributeName)`
 *
 * @body
 *
 * ```js
 * encoder.decode(attributeName); // -> "{(^$foo/bar baz)}"
 *
 * ```
 *
 * @param {String} attributeName The encoded attribute name.
 * @return {String} The decoded attribute name.
 *
 */
encoder.decode = function(name) {
	var decoded = name;

	// decode uppercase characters in new bindings
	if (!caseMattersAttributes[decoded] && decoded.match(regexes.uppercaseDelimiterThenChar)) {
		if (startsWith(decoded, 'on:') || endsWith(decoded, ':to') || endsWith(decoded, ':from') || endsWith(decoded, ':bind')) {
			decoded = decoded
				.replace(regexes.uppercaseDelimiterThenChar, function(match, char) {
					return char.toUpperCase();
				});
		}
	}

	return decoded;
};

if (namespace.encoder) {
	throw new Error("You can't have two versions of can-attribute-encoder, check your dependencies");
} else {
	module.exports = namespace.encoder = encoder;
}
