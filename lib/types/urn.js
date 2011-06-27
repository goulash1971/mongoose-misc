/**
 * lib/types/urn.js - the URN type
 *
 * Copyright 2011, Stuart Hudson <goulash1971@yahoo.com>
 * Released under the terms of the MIT License.
 * 
 * Version 0.0.2
 */
var mongoose = require("mongoose");
var urn = require("urn-parser");

/**
 * Utility function that will validate a value using a simple regular expression
 * that check the format is `urn:[namespace]:[value]`
 *
 * @param {Object} the single object to be handled
 * @return {Boolean} indicating valid ({@code true}) or not ({@code false})
 * @api private
 */
function validator (value) {
    var re = /^urn:((?:[a-z][a-z]+)):(([\w#!:.?+=&%@!\-\/])+)?/i;
    return re.test(value);
}

/**
 * Utility function that will normalize an uri value {@param value} using the
 * standard URN formatting functionality {@see urn-parser.format}
 *
 * @param {String} the urn value to be normalized
 * @return {String} the normalized urn
 * @api public
 */
exports.normalize =  function (value) {
	return urn.format(value);
};


/**
 * Loader that loads the type into the mongoose infrastructure
 *
 * @param {Mongoose} the active Mongoose instance for installation
 * @result {Object} the type that is loaded
 *
 * @api public
 */
exports.loadType = function (mongoose) {
  // The types that are used for schema and models
  var SchemaType = mongoose.SchemaType;
  var SchemaTypes = mongoose.SchemaTypes;

  // Constructor for schema type
  function Urn (value, options) {
    SchemaTypes.String.call(this, value, options);
	this.validate (validator, 'invalid urn format');
  };

  // Inheritence from 'String' schema type
  Urn.prototype.__proto__ = SchemaTypes.String.prototype;

  // Casting function performs some normalisation of the urn
  Urn.prototype.cast = function (value) {
	  return exports.normalize(value);
  };

  // Perform the installation
  mongoose.SchemaTypes.Urn = Urn;
  mongoose.Types.Urn = String;

  // Return the type
  return Urn;
}
