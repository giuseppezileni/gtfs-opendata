const Collections = require('../database');

/*
 * Returns an array of calendarDates that match the query parameters.
 */
exports.getCalendarDates = query => Collections.CalendarDate.find(query);
