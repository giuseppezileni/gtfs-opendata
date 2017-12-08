const Collections = require('../database');

/*
 * Returns an array of stop_attributes that match the query parameters.
 */
exports.getStopAttributes = query => Collections.StopAttributes.find(query);
