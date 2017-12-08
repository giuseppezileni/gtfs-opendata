
const _ = require('lodash');
const utils = require('../utils');
const geojsonUtils = require('../geojson-utils');
const config = require('../config');

const stopsToGeoJSON = async stops => {
  
  const agencies = {};

  // Get all agencies for reference
  const results = await collections.Agency.find({}).lean();
  results.forEach(agency => {
    agencies[agency.agency_key] = agency;
  });

  const preparedStops = [];
  for (const item of stops) {
    const stop = item.toObject();
    const agency = agencies[stop.agency_key];
    stop.agency_name = agency.agency_name;

    const tripIds = await collections.StopTime.find({
      agency_key: stop.agency_key,
      stop_id: stop.stop_id
    })
    .distinct('trip_id');

    const routeIds = await collections.Trip.find({
      agency_key: stop.agency_key
    })
    .distinct('route_id')
    .where('trip_id').in(tripIds);

    stop.routes = await collections.Route.find({
      agency_key: stop.agency_key
    })
    .where('route_id').in(routeIds)
    .select({_id: 0, agency_key: 0, agency_id: 0, route_type: 0})
    .lean();
    preparedStops.push(stop);
  }

  return geojsonUtils.featuresToGeoJSON(geojsonUtils.stopsToGeoJSONFeatures(preparedStops));
};

/*
 * Returns an array of stops that match the query parameters. A `within`
 * parameter containing `lat`, `lon` and optionally `radius` in miles may be
 * passed to search for agencies in a specific area.
 */
exports.getStops = async (query = {}) => {

  if (query.route_id !== undefined) {
    
    if (query.agency_key === 'undefined') {
      throw new Error('`agency_key` is a required parameter if `route_id` is specified.');
    }

    const tripQuery = {
      agency_key: query.agency_key,
      route_id: query.route_id
    };

    if (query.direction_id !== undefined) {
      tripQuery.direction_id = query.direction_id;
    };

    const trips =  await collections.Trip.find(tripQuery).select(
      {trip_id: 1, 
        direction_id: 1}
    );

    if (trips.length === 0) {
      return [];
    }

    const stoptimesList = [];

    for (const trip of trips) {
      const stoptimes = await collections.StopTime.find({
        agency_key: query.agency_key,
        trip_id: trip.trip_id
      })
      .sort('stop_sequence')
      .select({stop_sequence: 1, stop_id: 1});

      stoptimesList.push(stoptimes);
    }

    const sortedStoptimes = _.flatten(_.sortBy(stoptimesList, stoptimes => {
      return stoptimes.length;
    }));

    // Get a distinct list of stops
    const distinctStoptimes = sortedStoptimes.reduce((memo, stoptime) => {
      memo[stoptime.stop_id] = stoptime;
      return memo;
    }, {});

    // Order stops by stop_sequence
    const stopIds = _.sortBy(distinctStoptimes, stoptime => stoptime.stop_sequence).map(stoptime => stoptime.stop_id);

    query.stop_id = {$in: stopIds};
    delete query.route_id;
    delete query.direction_id;

    var p = new Promise((resolve, reject) => {  

      var coords = [];
      coords[0] = lon;
      coords[1] = lat;

      resolve(collections.Stop.find(query));    
    });

    p.catch((err) => console.log("error: ", err.message));

  }

  if (query.within !== undefined) {
    
    if (!query.within.lat || !query.within.lon) {
      throw new Error('`within` must contain `lat` and `lon`.');
    }

    let {lat, lon, radius} = query.within;

    if (radius === undefined) {
      radius = 500;
    }
    delete query.within;

    console.log('Quering Stops ...');

    var area = { center: [lon, lat], radius: radius, spherical: true };

    console.log('Quering data from area: ' + JSON.stringify(area));
    console.log('Quering model Stop: ' + JSON.stringify(collections.Stop));

    var promise = await collections.Stop
      .where('loc')
      .within()
      .circle(area).exec();

    console.log('Promise: ' + JSON.stringify(promise));

    promise
    .then(function(stops) {
      console.log('get stops n.' + _.size(stops));
      // do something with updated user
      return stops;
    })
    .catch(function(err){
      // just need one of these
      console.log('error: ', err);
      return null;
    });

  }
  
};

/*
 * Returns geoJSON with stops for the `agencyKey` specified, optionally limited
 * to the `stopIds` specified
 */
exports.getStopsAsGeoJSON = async (query = {}) => {
  const stops = await exports.getStops(query);
  return stopsToGeoJSON(stops);
};
