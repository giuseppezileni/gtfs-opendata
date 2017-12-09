const mongoose = require('mongoose');

// ***********************************************
// Schemas
// ***********************************************

// stopTimeSchema
const StopTime_Schema = new mongoose.Schema({
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

StopTime_Schema.index({
	agency_key: 1,
	stop_id: 1,
	trip_id: 1
});

// agency
const Agency_schema = new mongoose.Schema({
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
});

// Stop
const Stop_schema = new mongoose.Schema({
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
});

// Trip
const Trip_schema = new mongoose.Schema({
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
});

// CalendarDate
const CalendarDate_schema = new mongoose.Schema({
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
});

// Calendar
const Calendar_schema = new mongoose.Schema({
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
});

// FareAttribute
const FareAttribute_schema = new mongoose.Schema({
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
});

// FareRule
const FareRule_schema = new mongoose.Schema({
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
});

// FeedInfo
const FeedInfo_schema = new mongoose.Schema({
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
});

// Frequencies
const Frequencies_schema = new mongoose.Schema({
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
});

// Shape
const Shape_schema = new mongoose.Schema({
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
});

// StopAttributes
const StopAttributes_schema = new mongoose.Schema({
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
});

// TimetablePage
const TimetablePage_schema = new mongoose.Schema({
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
});

// TimetableStopOrder
const TimetableStopOrder_schema = new mongoose.Schema({
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
});

// Timetable
const Timetable_schema = new mongoose.Schema({
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
});

// ***********************************************
// Models
// ***********************************************
/*
module.exports.Agency = mongoose.model('Agency', Agency_schema);
module.exports.Stop = mongoose.model('Stop', Stop_schema);
module.exports.Trip = mongoose.model('Trip', Trip_schema);
module.exports.StopTime = mongoose.model('StopTime', StopTime_Schema);
module.exports.CalendarDate = mongoose.model('CalendarDate', CalendarDate_schema);
module.exports.Calendar = mongoose.model('Calendar', Calendar_schema);
module.exports.FareAttribute = mongoose.model('FareAttribute', FareAttribute_schema);
module.exports.FareRule = mongoose.model('FareRule', FareRule_schema);
module.exports.FeedInfo = mongoose.model('FeedInfo', FeedInfo_schema);
module.exports.Frequencies = mongoose.model('Frequencies', Frequencies_schema);
module.exports.Shape = mongoose.model('Shape', Shape_schema);
module.exports.StopAttributes = mongoose.model('StopAttributes', StopTime_Schema);
module.exports.TimetablePage = mongoose.model('TimetablePage', TimetablePage_schema);
module.exports.TimetableStopOrder = mongoose.model('TimetableStopOrder', TimetableStopOrder_schema);
module.exports.Timetable = mongoose.model('Timetable', Timetable_schema);
*/

const db = {
  open: async (url) => {
      console.log('connect mongodb: ' + url);
      mongoose.connect(url, {
        useMongoClient: true
      });
      mongoose.Promise = require('bluebird');
  },

  close: async () => {
  	mongoose.connection.close(function () {
  	  console.log('Mongoose connection disconnected');
    })
  },

  Agency: mongoose.model('Agency', Agency_schema),
  Stop: mongoose.model('Stop', Stop_schema),
  Trip: mongoose.model('Trip', Trip_schema),
  StopTime: mongoose.model('StopTime', StopTime_Schema),
  CalendarDate: mongoose.model('CalendarDate', CalendarDate_schema),
  Calendar: mongoose.model('Calendar', Calendar_schema),
  FareAttribute: mongoose.model('FareAttribute', FareAttribute_schema),
  FareRule: mongoose.model('FareRule', FareRule_schema),
  FeedInfo: mongoose.model('FeedInfo', FeedInfo_schema),
  Frequencies: mongoose.model('Frequencies', Frequencies_schema),
  Shape: mongoose.model('Shape', Shape_schema),
  StopAttributes: mongoose.model('StopAttributes', StopTime_Schema),
  TimetablePage: mongoose.model('TimetablePage', TimetablePage_schema),
  TimetableStopOrder: mongoose.model('TimetableStopOrder', TimetableStopOrder_schema),
  Timetable: mongoose.model('Timetable', Timetable_schema)

};

module.exports = db;
