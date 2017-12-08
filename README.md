# GTFS-OpenData

`GTFS-OpenData` legge dati [GTFS format](https://developers.google.com/transit/) importandoli in un database MongoDB.
API che forniscono informazioni sulle tratte urbane ed extraurbane dei comuni che hanno digitalizzato gli orari e tutti le informazioni in formato GTFS, compreso BUS, metropolitana, Bici e tutti i mezzi di mobilità sostenibile

---

## Installation

Install `gtfs-opendata` directly from [npm](https://npmjs.org):

  ```
    npm install gtfs-opendata --save

  ```
## Import GTFS Data

  Setup config.js

  ```
    const config = {
      mongoUrl: "mongodb://localhost:27017/gtfs",
      dev: true,
      agencies: [
      {
        agency_key: "gdc",
        file: "gtfs_tpl_gioiadelcolle.zip",
        dir: "gtfs_tpl_gioiadelcolle"
      },
      {
        agency_key: "sco",
        file: "gtfs_scoppio_miulli.zip",
        dir: "gtfs_scoppio_miulli"
      },
      {
        agency_key: "stp",
        file: "gtfs_stp_gioiadelcolle.zip",
        dir: "gtfs_stp_gioiadelcolle"
      },
      {
        agency_key: "sita",
        file: "gtfs_sita_gioiadelcolle.zip",
        dir: "gtfs_sita_gioiadelcolle"
      }]
  };

  module.exports = config;

  ```

  ```
  const config = require('./config');
  const gtfs = require('gtfs-opendata');

  var url = req.protocol + '://' + req.get('host') + '/opendata/gtfs/';

  var mongo_url = 'mongodb://localhost:27017/gtfs';


  bot_gtfs.import(config, url, mongo_url);

  ```

## Code example

  ```
    const gtfs = require('gtfs-opendata');

    var params = {
      within: {
          lat: lat,
          lon: lng,
          radius: 1000
        },
      res: res
    };

    var mongo_url = 'mongodb://localhost:27017/gtfs';
    var stops = bot_gtfs.stops(mongo_url, params);

  ```
