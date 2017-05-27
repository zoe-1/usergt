'use strict';

const Boom = require('boom');
const Penseur = require('penseur');
const Tables = require('../../table');

// Query.user.setLockout

module.exports.setLockout = function (userId, callback) {

    if ((!this.db) || (!this.connected)) {
        const error = Boom.internal('db connection not established');
        return callback(error);
    }

    const db = this.db;

    // initiate lockout

    const now = Date.now();
    const hours24 = (((1000 * 60) * 60) * 24);
    const lockUntil = now + hours24;

    const changeLockUntil = {
        lockUntil
    };

    this.db.user.update(userId, changeLockUntil, (err) => {

        if (err) {

            if (err.message === 'No document found') {
                const error = Boom.internal('setLockout.query - db.user.update - No document found');
                return callback(error, null);
            }

            const error = Boom.internal('Query.user.setLockout - db.user.update - failed to set lockout');
            return callback(error, null);
        }

        db.user.get(userId, (err, userDocument) => {

            if (err) {
                const error = Boom.internal('setLockout.query - db.user.get - failed to get updated userDocument');
                return callback(error, null);
            }
        
            return callback(null, userDocument);
        });
    });
};
