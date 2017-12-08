const Collections = require('../database');

/*
 * Returns an array of fare_attributes that match the query parameters.
 */
exports.getFareAttributes = query => Collections.FareAttribute.find(query);
