const Collections = require('../database');

/*
 * Returns an array of feed_info that match the query parameters.
 */
exports.getFeedInfo = query => Collections.FeedInfo.find(query);
