'use strict';

const Boom = require('boom');
const Penseur = require('penseur');
const Tables = require('../../table');

// Query.user.expireLockout

module.exports.expireLockout = function (userId, callback) {

    if ((!this.db) || (!this.connected)) {
        const error = Boom.internal('db connection not established');
        return callback(error);
    }

    const lockUntil = Date.now() - 60 * 1000;
    // const loginAttempts = 0;

    this.db.user.update(userId, { lockUntil }, (err) => {

        if (err) {
            const error = Boom.internal('db.user.update - turn off lockout failed');
            // db.close();
            return callback(error);
        }

        return callback(null);
    });
};
