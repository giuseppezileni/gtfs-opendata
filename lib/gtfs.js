const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
const utils = require('./utils');

// const geojsonUtils = require('./geojson-utils');
const { forEach } = require('p-iteration');

// ***********************************************
// GTFS import script
// ***********************************************
const importGTFS = require('./import');

exports.import = importGTFS;

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
// Models 
// ***********************************************

const Agency = mongoose.model('Agency', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  agency_id: String,
  agency_name: {
    type: String,
    required: true
  },
  agency_url: {
    type: String,
    required: true
  },
  agency_timezone: {
    type: String,
    required: true
  },
  agency_lang: String,
  agency_phone: String,
  agency_fare_url: String,
  agency_bounds: {
    sw: {
      type: Array,
      index: '2dsphere'
    },
    ne: {
      type: Array,
      index: '2d'
    }
  },
  agency_center: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
  },
  date_last_updated: Number
}));

// Stop
var Stop = mongoose.model('Stop', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  stop_id: {
    type: String,
    required: true,
    index: true
  },
  stop_code: {
    type: String,
    index: true
  },
  stop_name: {
    type: String,
    required: true
  },
  stop_desc: String,
  stop_lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  stop_lon: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  loc: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
  },
  zone_id: String,
  stop_url: String,
  location_type: {
    type: Number,
    min: 0,
    max: 1
  },
  parent_station: String,
  stop_timezone: String,
  wheelchair_boarding: {
    type: Number,
    min: 0,
    max: 2
  }
}));

// Trip
const Trip = mongoose.model('Trip', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  route_id: {
    type: String,
    required: true,
    index: true
  },
  service_id: {
    type: String,
    required: true,
    index: true
  },
  trip_id: {
    type: String,
    required: true,
    index: true
  },
  trip_headsign: String,
  trip_short_name: String,
  direction_id: {
    type: Number,
    index: true,
    min: 0,
    max: 1
  },
  block_id: String,
  shape_id: String,
  wheelchair_accessible: {
    type: Number,
    min: 0,
    max: 2
  },
  bikes_allowed: {
    type: Number,
    min: 0,
    max: 2
  },
  loc: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
  }
}));

// stopTimeSchema
const stopTimeSchema = new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  trip_id: {
    type: String,
    required: true,
    index: true
  },
  arrival_time: {
    type: String,
    required: true
  },
  departure_time: {
    type: String,
    required: true
  },
  stop_id: {
    type: String,
    required: true
  },
  stop_sequence: {
    type: Number,
    required: true,
    index: true,
    min: 0
  },
  stop_headsign: String,
  pickup_type: {
    type: Number,
    index: true,
    min: 0,
    max: 3
  },
  drop_off_type: {
    type: Number,
    index: true,
    min: 0,
    max: 3
  },
  shape_dist_traveled: Number,
  timepoint: {
    type: Number,
    min: 0,
    max: 1
  }
});

stopTimeSchema.index({
	agency_key: 1,
	stop_id: 1,
	trip_id: 1
});

const StopTime = mongoose.model('StopTime', stopTimeSchema);

// *********************************************************
//
// CalendarDate Model
//
// *********************************************************

const CalendarDate = mongoose.model('CalendarDate', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  service_id: {
    type: String,
    required: true
  },
  date: {
    type: Number,
    required: true
  },
  exception_type: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  holiday_name: String
}));

module.exports = CalendarDate;

// *********************************************************
//
// Calendar Model
//
// *********************************************************

const Calendar = mongoose.model('Calendar', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  service_id: {
    type: String,
    required: true
  },
  monday: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  tuesday: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  wednesday: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  thursday: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  friday: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  saturday: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  sunday: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  start_date: {
    type: Number,
    required: true,
    min: 10000000
  },
  end_date: {
    type: Number,
    required: true,
    min: 10000000
  }
}));

module.exports = Calendar;

// *********************************************************
//
// FareAttribute Model
//
// *********************************************************

const FareAttribute = mongoose.model('FareAttribute', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  fare_id: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency_type: {
    type: String,
    required: true
  },
  payment_method: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  transfers: {
    type: Number,
    min: 0,
    max: 2
  },
  transfer_duration: {
    type: Number,
    min: 0
  }
}));

module.exports = FareAttribute;

// *********************************************************
//
// FareRule Model
//
// *********************************************************

const FareRule = mongoose.model('FareRule', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  fare_id: {
    type: String,
    required: true
  },
  route_id: String,
  origin_id: String,
  destination_id: String,
  contains_id: String
}));

module.exports = FareRule;

// *********************************************************
//
// FeedInfo Model
//
// *********************************************************

const FeedInfo = mongoose.model('FeedInfo', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  feed_publisher_name: {
    type: String,
    required: true
  },
  feed_publisher_url: {
    type: String,
    required: true
  },
  feed_lang: {
    type: String,
    required: true
  },
  feed_start_date: {
    type: Number,
    min: 10000000
  },
  feed_end_date: {
    type: Number,
    min: 10000000
  },
  feed_version: String
}));

module.exports = FeedInfo;

// *********************************************************
//
// Frequencies Model
//
// *********************************************************

const Frequencies = mongoose.model('Frequencies', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  trip_id: {
    type: String,
    required: true
  },
  start_time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  headway_secs: {
    type: Number,
    required: true,
    min: 0
  },
  exact_times: {
    type: Number,
    min: 0,
    max: 1
  }
}));

module.exports = Frequencies;

// *********************************************************
//
// Shape Model
//
// *********************************************************

const Shape = mongoose.model('Shape', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  shape_id: {
    type: String,
    required: true,
    index: true
  },
  shape_pt_lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  shape_pt_lon: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  loc: {
    type: Array,
    index: '2d'
  },
  shape_pt_sequence: {
    type: Number,
    required: true
  },
  shape_dist_traveled: Number
}));

module.exports = Shape;

// *********************************************************
//
// StopAttributes Model
//
// *********************************************************

const StopAttributes = mongoose.model('StopAttributes', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  stop_id: {
    type: String,
    index: true
  },
  stop_city: String
}));

module.exports = StopAttributes;

// *********************************************************
//
// stopTimeSchema Model
//
// *********************************************************

// *********************************************************
//
// Stop Model
//
// *********************************************************

// *********************************************************
//
// TimetablePage Model
//
// *********************************************************

const TimetablePage = mongoose.model('TimetablePage', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  timetable_page_id: {
    type: String,
    index: true
  },
  timetable_page_label: String,
  filename: String

}));

module.exports = TimetablePage;

// *********************************************************
//
// TimetableStopOrder Model
//
// *********************************************************

const TimetableStopOrder = mongoose.model('TimetableStopOrder', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  timetable_id: {
    type: String,
    index: true
  },
  stop_id: String,
  stop_sequence: Number
}));

module.exports = TimetableStopOrder;

// *********************************************************
//
// Timetable Model
//
// *********************************************************

const Timetable = mongoose.model('Timetable', new mongoose.Schema({
  agency_key: {
    type: String,
    required: true,
    index: true
  },
  timetable_id: {
    type: String,
    index: true
  },
  route_id: {
    type: String,
    index: true
  },
  direction_id: {
    type: Number,
    index: true,
    min: 0,
    max: 1
  },
  service_id: {
    type: String,
    index: true
  },
  start_date: Number,
  end_date: Number,
  monday: {
    type: Number,
    min: 0,
    max: 1
  },
  tuesday: {
    type: Number,
    min: 0,
    max: 1
  },
  wednesday: {
    type: Number,
    min: 0,
    max: 1
  },
  thursday: {
    type: Number,
    min: 0,
    max: 1
  },
  friday: {
    type: Number,
    min: 0,
    max: 1
  },
  saturday: {
    type: Number,
    min: 0,
    max: 1
  },
  sunday: {
    type: Number,
    min: 0,
    max: 1
  },
  timetable_label: String,
  service_notes: String,
  orientation: String,
  timetable_page_id: {
    type: String,
    index: true
  },
  timetable_sequence: {
    type: Number,
    index: true
  },
  direction_name: String
}));

module.exports = Timetable;

// ***********************************************
// Methods 
// ***********************************************

// Stops
exports.stops = async (url, query = {}) => {

  console.log('url: -> ' + url);
  open_db(url);

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

		const trips =  await Trip.find(tripQuery).select(
		  {trip_id: 1, 
		    direction_id: 1}
		);

		if (trips.length === 0) {
		  return [];
		}

		const stoptimesList = [];

		for (const trip of trips) {
		  const stoptimes = await StopTime.find({
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

    q
      .then(function(stops) {
        console.log('get stops n.' + _.size(stops));
        console.log('Stops: ' + JSON.stringify(stops));
        query.res.status(200).json(stops); 
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

	if (query.within !== undefined) {

		if (!query.within.lat || !query.within.lon) {
		  throw new Error('`within` must contain `lat` and `lon`.');
		}

		let {lat, lon, radius} = query.within;

		if (radius === undefined) {
		  radius = 1000;
		};
		// delete query.within;

		var area = { center: [lon, lat], radius: radius, spherical: true };

		console.log('Quering data from area: ' + JSON.stringify(area));
		
    // exec query
    var q = Stop
      .where('loc')
      .near([lon, lat])
      .maxDistance(utils.milesToDegrees(radius));

    q
      .then(function(stops) {
        console.log('get stops n.' + _.size(stops));
        query.res.status(200).json(stops);
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

// agencies
exports.agencies = async (url, query = {}) => {

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

exports.trips = async (url, query = {}) => {

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

exports.stoptimes = async (url, query = {}) => {

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