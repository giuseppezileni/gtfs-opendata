const Collections = require('../database');

/*
 * Returns an array of stoptimes that match the query parameters.
 */
exports.getStoptimes = async (query = {}) => {

  if (query.agency_key === 'undefined') {
    throw new Error('`agency_key` is a required parameter.');
  }
  if (query.stop_id === 'undefined') {
    throw new Error('`stop_id` is a required parameter.');
  }

  if (query.trip_id === undefined) {
    
    const tripQuery = {
      agency_key: query.agency_key
    };

    if (query.service_id !== undefined) {
      tripQuery.service_id = query.service_id;
      delete query.service_id;
    }

    if (query.route_id !== undefined) {
      tripQuery.route_id = query.route_id;
      delete query.route_id;
    }

    if (query.direction_id !== undefined) {
      tripQuery.direction_id = query.direction_id;
      delete query.direction_id;
    }

    const tripIds = await Collections.Trip.find(tripQuery).distinct('trip_id');

    query.trip_id = {
      $in: tripIds
    };
  }

  var q = Collections.StopTime.find(query).sort({stop_sequence: 1});
  utils.execQuery(q);
};
