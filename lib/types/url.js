/**
 * lib/types/url.js - the URL type
 *
 * Copyright 2011, Stuart Hudson <goulash1971@yahoo.com>
 * Released under the terms of the MIT License.
 * 
 * Version 0.0.2
 */
var mongoose = require("mongoose");
var url = require("url");

/**
 * Utility function that will validate a value using a simple regular expression
 * that check the format is `[scheme]://[path]` i.e. this only works for path 
 * based schemes and not others such as `mailto:`
 *
 * @param {Object} the single object to be handled
 * @return {Boolean} indicating valid ({@code true}) or not ({@code false})
 * @api private
 */
function validator (value) {
    var re = /((?:[a-z][a-z]+)):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i;
    return re.test(value);
}


/**
 * Utility function that will sort a query (keys and values) and produce a new
 * query string that is sorted by key order.
 *
 * @param {Object} query as keys and values
 * @return {String} a new query strinng sorted in key order
 * @acknowledgement Brian Noguchi (mongoose-types)
 * @api private
 */
function sortedQuery (query) {
  var keys = [], name, i, len, key, sorted = [];
  for (name in query) {
    for (i = 0, len = keys.length; i < len; i++) {
      if (keys[i] >= name) break;
    }
    keys.splice(i, 0, name);
  }
  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    sorted.push(key + "=" + query[key]);
  }
  if (sorted.length !== 0)
	return sorted.join("&");
};

/**
 * Utility function that will normalize an url value {@param value} according to
 * the standards (http://en.wikipedia.org/wiki/URL_normalization)
 *
 * @param {String} the url value to be normalized
 * @return {String} the normalized url
 * @acknowledgement Brian Noguchi (mongoose-types)
 * @api public
 */
exports.normalize =  function (value) {
  // Parse out the components for recombination into the normalized value
  var parsed = url.parse(value, true);
  var protocol = parsed.protocol;
  var hostname = parsed.hostname;
  var pathname = parsed.pathname;
  var query = sortedQuery(parsed.query);

  var hash = parsed.hash;
  // Convert scheme and host to lower case; Remove www. if it exists in hostname;
  // Remove dot-segments; Remove duplicate slashes; Add trailing /; query & hash
  return (protocol ? protocol.toLowerCase() : '') + "//" + 
		(hostname ? hostname.toLowerCase().replace(/^www\./, "") : '') +
		(pathname ? pathname.replace(/\/\.{1,2}\//g, "/").replace(/\/{2,}/, "/") :  "/") +
		(query ? "?" + query : '') + (hash ? hash : '');
};


/**
 * Loader that loads the type into the mongoose infrastructure
 *
 * @param {Mongoose} the active Mongoose instance for installation
 * @result {Object} the type that is loaded
 *
 * @acknowledgement Brian Noguchi (mongoose-types)
 * @api public
 */
exports.loadType = function (mongoose) {
  // The types that are used for schema and models
  var SchemaType = mongoose.SchemaType;
  var SchemaTypes = mongoose.SchemaTypes;

  // Constructor for schema type
  function Url (value, options) {
    SchemaTypes.String.call(this, value, options);
	this.validate (validator, 'invalid url format');
  };

  // Inheritence from 'String' schema type
  Url.prototype.__proto__ = SchemaTypes.String.prototype;

  // Casting function performs some normalisation of the url
  Url.prototype.cast = function (value) {
	  return exports.normalize(value);
  };

  // Perform the installation
  mongoose.SchemaTypes.Url = Url;
  mongoose.Types.Url = String;

  // Return the type
  return Url;
}
