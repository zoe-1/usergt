'use strict';

const Config = require('../../config');
const Penseur = require('penseur');
const Tables = require('../../table');
const Boom = require('boom');

// Query.user.findByUsername

module.exports.findByUsername = function (username, callback) {

    if ((!this.db) || (!this.connected)) {
        const error = Boom.internal('db connection not established');
        return callback(error, null);
    }

    this.db.user.query({ username }, (err, userRecord) => {

        if (err) {
            const error = Boom.internal('db.user.query failed');
            return callback(error, null);
        }

        if (userRecord === null) {
            const error = Boom.notFound('username does not exist');
            return callback(error, null);
        }

        return callback(null, userRecord[0]);
    });
};
