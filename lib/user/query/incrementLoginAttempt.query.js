'use strict';

const Boom = require('boom');
const Penseur = require('penseur');
const Tables = require('../../table');

// Query.user.resetLoginAttempt

module.exports.incrementLoginAttempt = function (userId, callback) {

    if ((!this.db) || (!this.connected)) {
        const error = Boom.internal('db connection not established');
        return callback(error);
    }

    const db = this.db;

    const changes = {
            loginAttempts: this.db.increment(1)
    };


    this.db.user.update(userId, changes, (err) => {

        if (err) {

            if (err.message === 'No document found') {
                const error = Boom.notFound('document to increment does not exist');
                return callback(error, null);
            }

            const error = Boom.internal('db.user.update - incrementLoginAttempt failed');
            return callback(error);
        }

        db.user.get(userId, (err, userDocument) => {

            if (err) {
                const error = Boom.internal('db.user.update - failed get incremented loginAttempts userdoc');
                return callback(error);
            }
        
            return callback(null, userDocument);
        });
    });
};
