const Collections = require('../database');

/*
 * Returns an array of timetables that match the query parameters.
 */
exports.getTimetables = query => Collections.Timetable.find(query);
