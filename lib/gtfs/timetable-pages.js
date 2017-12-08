const Collections = require('../database');

/*
 * Returns an array of timetable_pages that match the query parameters.
 */
exports.getTimetablePages = query => Collections.TimetablePage.find(query);
