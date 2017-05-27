'use strict';

const Boom = require('boom');
const Penseur = require('penseur');
const Tables = require('../../table');

// Query.user.resetLoginAttempt

module.exports.resetLoginAttempt = function (userId, callback) {

    if ((!this.db) || (!this.connected)) {
        const error = Boom.internal('db connection not established');
        return callback(error);
    }

    const db = this.db;

    const loginAttempts = 0;

    return this.db.user.update(userId, { loginAttempts }, (err) => {

        if (err) {
            const error = Boom.internal('resetLoginAttempt - db.user.update - set loginAttempts to zero failed');
            return callback(error, null);
        }

        return db.user.get(userId, (err, userDocument) => {

            if (err) {
                const error = Boom.internal('resetLoginAttempt - db.user.get - failed to get userdoc');
                return callback(error, null);
            }
        
            return callback(null, userDocument);
        });
    });
};
