const Collections = require('../database');
/*
 * Returns an array of calendars that match the query parameters.
 */
exports.getCalendars = query => Collections.Calendar.find(query);
