const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
const utils = require('./lib/utils');

const { forEach } = require('p-iteration');

// ***********************************************
// GTFS import script
// ***********************************************
const importGTFS = require('./lib/import');

module.exports.import = importGTFS;

// ***********************************************
// Database Scripts
// ***********************************************

const open_db = async (url) => {

    console.log('connect mongodb: ' + url);

    mongoose.connect(url, {
      useMongoClient: true,
      /* other options */
    });

    mongoose.Promise = require('bluebird');
};

const close_db = async () => {
	mongoose.connection.close(function () {
	  console.log('Mongoose connection disconnected');
	});
};

// ***********************************************
// Methods
// ***********************************************

// Stops
module.exports.stops = (url, query = {}) => {

  console.log('url: -> ' + url);
  open_db(url);
  var error_data = false;
  var stops_dropped;

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

    const trips =  Trip.find(tripQuery).select(
		// const trips =  await Trip.find(tripQuery).select(
		  {trip_id: 1,
		    direction_id: 1}
		);

		if (trips.length === 0) {
		  return [];
		}

		const stoptimesList = [];

		for (const trip of trips) {
      const stoptimes = StopTime.find({
      // const stoptimes = await StopTime.find({
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

    // exec query
    var q = Stop.find();
    console.log('query executed ... find without params');

    q
      .then(function(stops) {

        console.log('get stops n.' + _.size(stops));

        var nsize = 0;

        if (_.size(stops) > query.size && query.size > 0) {
          nsize = _.size(stops) - query.size;
        };

        stops_dropped = _.dropRight(stops, nsize);

        console.log('dropped first n.' + nsize);
        console.log('stops dropped n.' + _.size(stops_dropped));

        // query.res.status(200).jsonp(stops_dropped);
      })
      .then(function () {
        console.log('close database');
        close_db();
        error_data = false;
      })
      .catch(function(err) {
        console.log('error database');
        // query.res.status(500).json(err);
        error_data = true;
    });

	};

	if (query.within !== undefined) {

		if (!query.within.lat || !query.within.lon) {
		  throw new Error('`within` must contain `lat` and `lon`.');
		};

		let {lat, lon, radius} = query.within;

		if (radius === undefined) {
		  radius = 1000;
		};
		// delete query.within;

		var area = { center: [lon, lat], radius: radius, spherical: true };

		// exec query
    console.log('start promise ... ');

    return new Promise((resolve, reject) => {

      var q = Stop
        .where('loc')
        .near([lon, lat])
        .maxDistance(utils.milesToDegrees(radius));

        console.log('query executed ... with params -> ' + JSON.stringify(area));

        q
          .then(function(stops) {

            console.log('get stops n.' + _.size(stops));

            var nsize = 0;

            if (_.size(stops) > query.size && query.size > 0) {
              nsize = _.size(stops) - query.size;
            };

            stops_dropped = _.dropRight(stops, nsize);

            console.log('dropped first n.' + nsize);
            console.log('stops dropped n.' + _.size(stops_dropped));
            resolve(stops_dropped);
            // query.res.status(200).json(stops_dropped);
          })
          .then(function () {
            console.log('close database');
            close_db();
          })
          .catch(function(err) {
            console.log('error database');
            reject(err);
        });

    });

	}
};

// agencies
module.exports.agencies = async (url, query = {}) => {

  open_db(url);

  if (query.within !== undefined) {
    if (!query.within.lat || !query.within.lon) {
      throw new Error('`within` must contain `lat` and `lon`.');
    }

    let {lat, lon, radius} = query.within;

    if (radius === undefined) {
      radius = 500;
    }

    var q = Agency
      .where('agency_center')
      .near([lon, lat])
      .maxDistance(utils.milesToDegrees(radius));

    q
      .then(function(agencies) {
        console.log('get agencies n.' + _.size(agencies));
        console.log('Agencies: ' + JSON.stringify(agencies));
        query.res.status(200).json(agencies);
      })
      .then(function () {
        console.log('close database');
        close_db();
      })
      .catch(function(err) {
        console.log('error database');
        query.res.status(500).json(err);
    });
  }

};

module.exports.trips = async (url, query = {}) => {

  open_db(url);

  const q = {
    trip_id: query.trip_id
  };

  var q1 = Trip
    .find(q);

  q1
    .then(function(trips) {
      console.log('get stoptimes n.' + _.size(trips));
      query.res.status(200).json(trips);
    })
    .then(function () {
      console.log('close database');
      close_db();
    })
    .catch(function(err) {
      console.log('error database');
      query.res.status(500).json(err);
  });

};

module.exports.stoptimes = async (url, query = {}) => {

  open_db(url);

  if (query.agency_key === 'undefined') {
    throw new Error('`agency_key` is a required parameter.');
  };

  if (query.stop_id === 'undefined') {
    throw new Error('`stop_id` is a required parameter.');
  };

  const q = {
    agency_key: query.agency_key,
    stop_id: query.stop_id
  };

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

    const tripIds = await Trip.find(tripQuery).distinct('trip_id');

    q.trip_id = {
      $in: tripIds
    };

    console.log('Trips -> ' + JSON.stringify(tripIds));

  };

  var now = moment().format('HH:mm');

  console.log('Now -> ' + now);

  var q1 = StopTime
    .find(q)
    .where('arrival_time').gt(now)
    .sort(
      {
        stop_sequence: 1,
        arrival_time: 1
      });

    q1
      .then(function(stoptimes) {
        console.log('get stoptimes n.' + _.size(stoptimes));
        // console.log('StopTimes: ' + JSON.stringify(stoptimes));

        query.res.status(200).json(stoptimes);
      })
      .then(function () {
        console.log('close database');
        close_db();
      })
      .catch(function(err) {
        console.log('error database');
        query.res.status(500).json(err);
    });
};

module.exports = require('./lib/gtfs');
