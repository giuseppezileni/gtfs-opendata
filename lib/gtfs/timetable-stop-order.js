const Collections = require('../database');

/*
 * Returns an array of timetable_stop_orders that match the query parameters.
 */
exports.getTimetableStopOrders = query => {
  return Collections.TimetableStopOrder.find(query).sort('stop_sequence');
};
