var namespace = require('can-namespace');
var dev = require('can-util/js/dev/dev');

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

function camelCaseToSpinalCase(match, lowerCaseChar, upperCaseChar) {
	return lowerCaseChar + "-" + upperCaseChar.toLowerCase();
}

function startsWith(allOfIt, startsWith) {
	return allOfIt.indexOf(startsWith) === 0;
}

function endsWith(allOfIt, endsWith) {
	return (allOfIt.length - allOfIt.indexOf(endsWith)) === endsWith.length;
}

var regexes = {
	leftParens: /\(/g,
	rightParens: /\)/g,
	leftBrace: /\{/g,
	rightBrace: /\}/g,
	camelCase: /([a-z])([A-Z])/g,
	forwardSlash: /\//g,
	space: /\s/g,
	uppercase: /[A-Z]/g,
	uppercaseDelimiterThenChar: /:u:([a-z])/g
};

var delimiters = {
	prependUppercase: ':u:',
	replaceSpace: ':s:',
	replaceForwardSlash: ':f:',
	replaceLeftParens: ':lp:',
	replaceRightParens: ':rp:',
	replaceLeftBrace: ':lb:',
	replaceRightBrace: ':rb:'
};

var encoder = {};

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
		} else {
			// convert uppercase characters in older bindings to kebab-case
			// - {fooBar}, (fooBar), {(fooBar)}
			encoded = encoded.replace(regexes.camelCase, camelCaseToSpinalCase);
			//!steal-remove-start
			dev.warn("can-attribute-encoder: Found attribute with name: " + name + ". Converting to: " + encoded + '.');
			//!steal-remove-end
		}
	}

	//encode spaces
	encoded = encoded.replace(regexes.space, delimiters.replaceSpace)
		//encode forward slashes
		.replace(regexes.forwardSlash, delimiters.replaceForwardSlash)
		// encode left parentheses
		.replace(regexes.leftParens, delimiters.replaceLeftParens)
		// encode right parentheses
		.replace(regexes.rightParens, delimiters.replaceRightParens)
		// encode left braces
		.replace(regexes.leftBrace, delimiters.replaceLeftBrace)
		// encode left braces
		.replace(regexes.rightBrace, delimiters.replaceRightBrace);

	return encoded;
};

encoder.decode = function(name) {
	var decoded = name;

	// decode left parentheses
	decoded = decoded.replace(delimiters.replaceLeftParens, '(')
		// decode right parentheses
		.replace(delimiters.replaceRightParens, ')')
		// decode left braces
		.replace(delimiters.replaceLeftBrace, '{')
		// decode left braces
		.replace(delimiters.replaceRightBrace, '}')
		// decode forward slashes
		.replace(delimiters.replaceForwardSlash, '/')
		// decode spaces
		.replace(delimiters.replaceSpace, ' ');

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
