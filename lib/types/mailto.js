/**
 * lib/types/mailto.js - the URL type
 *
 * Copyright 2011, Stuart Hudson <goulash1971@yahoo.com>
 * Released under the terms of the MIT License.
 * 
 * Version 0.0.2
 */
var mongoose = require("mongoose");
var mailto = require("mailto-parser");

/**
 * Utility function that will validate a value using a simple regular expression
 * that check the format is `mailto:[to]?[attributes]`
 *
 * @param {Object} the single object to be handled
 * @return {Boolean} indicating valid ({@code true}) or not ({@code false})
 * @api private
 */
function validator (value) {
    var re =  /^mailto:((?:(?:(?:[^:@]*)@)(?:[^:?]*)))?((?:[^?]*)(?:\?([^]*))?)/i;
    return re.test(value);
}

/**
 * Utility function that will normalize an uri value {@param value} using the
 * standard MailTo formatting functionality {@see uri-parser.format}
 *
 * @param {String} the mailto value to be normalized
 * @return {String} the normalized mailto
 * @api public
 */
exports.normalize =  function (value) {
	return mailto.format(value);
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
  function MailTo (value, options) {
    SchemaTypes.String.call(this, value, options);
	this.validate (validator, 'invalid mailto format');
  };

  // Inheritence from 'String' schema type
  MailTo.prototype.__proto__ = SchemaTypes.String.prototype;

  // Casting function performs some normalisation of the mailto
  MailTo.prototype.cast = function (value) {
	  return exports.normalize(value);
  };

  // Perform the installation
  mongoose.SchemaTypes.MailTo = MailTo;
  mongoose.Types.MailTo = String;

  // Return the type
  return MailTo;
}
