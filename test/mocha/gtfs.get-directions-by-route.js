const path = require('path');

const should = require('should');

const config = require('../config.json');
const gtfs = require('../../');

const database = require('../support/database');

// Setup fixtures
const agenciesFixtures = [{
  agency_key: 'caltrain',
  path: path.join(__dirname, '../fixture/caltrain_20160406.zip')
}];

const agencyKey = agenciesFixtures[0].agency_key;

config.agencies = agenciesFixtures;

describe('gtfs.getDirectionsByRoute():', () => {
  before(async () => {
    await database.connect(config);
  });

  after(async () => {
    await database.teardown();
    await database.close();
  });

  beforeEach(async () => {
    await database.teardown();
    await gtfs.import(config);
  });

  it('should return empty array if no route', async () => {
    await database.teardown();

    const routeId = 'not_real';
    const directions = await gtfs.getDirectionsByRoute({
      agency_key: agencyKey,
      route_id: routeId
    });

    should.exist(directions);
    directions.should.have.length(0);
  });

  it('should return expected directions', async () => {
    const routeId = 'Bu-16APR';

    const directions = await gtfs.getDirectionsByRoute({
      agency_key: agencyKey,
      route_id: routeId
    });

    should.exist(directions);
    directions.should.have.length(3);

    const direction = directions[0];

    should.exist(direction.route_id);
    should.exist(direction.trip_headsign);
    should.exist(direction.direction_id);
  });
});
