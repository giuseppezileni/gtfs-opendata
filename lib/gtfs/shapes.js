const _ = require('lodash');

const geojsonUtils = require('../geojson-utils');

const Collections = require('../database');

/*
 * Returns array of shapes that match the query parameters.
 */
exports.getShapes = async (query = {}) => {
  const shapes = [];
  let shapeIds;

  if (_.isString(query.shape_id)) {
    shapeIds = [query.shape_id];
  } else if (_.isObject(query.shape_id) && query.shape_id.$in !== undefined) {
    shapeIds = query.shape_id.$in;
  } else {
    const tripQuery = {};

    if (query.agency_key !== undefined) {
      tripQuery.agency_key = query.agency_key;
    }

    if (query.route_id !== undefined) {
      tripQuery.route_id = query.route_id;
      delete query.route_id;
    }

    if (query.trip_id !== undefined) {
      tripQuery.trip_id = query.trip_id;
      delete query.trip_id;
    }

    if (query.direction_id !== undefined) {
      tripQuery.direction_id = query.direction_id;
      delete query.direction_id;
    }

    if (query.service_id !== undefined) {
      tripQuery.service_id = query.service_id;
      delete query.service_id;
    }

    shapeIds = await Collections.Trip.find(tripQuery).distinct('shape_id');
  }

  for (const shapeId of shapeIds) {
    const shapeQuery = Object.assign({}, query, {shape_id: shapeId});
    const shapePoints = await Collections.Shape.find(shapeQuery).sort({shape_pt_sequence: 1});
    if (shapePoints.length > 0) {
      shapes.push(shapePoints);
    }
  }
  return shapes;
};

/*
 * Returns geoJSON of the shapes that match the query parameters.
 */
exports.getShapesAsGeoJSON = async (query = {}) => {
  const properties = {};

  if (query.agency_key === 'undefined') {
    throw new Error('`agency_key` is a required parameter.');
  }

  const agency = await Collections.Agency.findOne({
    agency_key: query.agency_key
  });
  properties.agency_name = agency ? agency.agency_name : '';
  properties.agency_key = agency ? agency.agency_key : '';

  const routeQuery = {
    agency_key: query.agency_key
  };

  if (query.route_id) {
    routeQuery.route_id = query.route_id;
    delete query.route_id;
  }

  const routes = await Collections.Route.find(routeQuery).select({_id: 0});
  const features = [];

  for (const route of routes) {
    const shapeQuery = Object.assign({route_id: route.route_id}, query);
    const shapes = await exports.getShapes(shapeQuery);
    const routeProperties = Object.assign(route.toObject(), properties);
    features.push(...geojsonUtils.shapesToGeoJSONFeatures(shapes, routeProperties));
  }

  return geojsonUtils.featuresToGeoJSON(features);
};
