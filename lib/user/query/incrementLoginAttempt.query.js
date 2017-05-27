'use strict';

const Boom = require('boom');
const Penseur = require('penseur');
const Tables = require('../../table');

// Query.user.resetLoginAttempt

module.exports.incrementLoginAttempt = function (userId, callback) {

    if ((!this.db) || (!this.connected)) {
        const error = Boom.internal('db connection not established');
        return callback(error, null);
    }

    const db = this.db;

    const changes = {
            loginAttempts: this.db.increment(1)
    };


    this.db.user.update(userId, changes, (err) => {

        if (err) {

            const error = Boom.internal('incrementLoginAttempt - db.user.update - failed to update userdoc');
            return callback(error, null);
        }

        db.user.get(userId, (err, userDocument) => {

            if (err) {
                const error = Boom.internal('incrementLoginAttempt - db.user.get - failed to get userdoc');
                return callback(error, null);
            }

            return callback(null, userDocument);
        });
    });
};
