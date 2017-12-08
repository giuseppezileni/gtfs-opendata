const Collections = require('../database');

/*
 * Returns an array of fare_rules that match the query parameters.
 */
exports.getFareRules = query => Collections.FareRule.find(query);
