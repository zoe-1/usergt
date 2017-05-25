'use strict';

const Penseur = require('penseur');
const Tables = require('../../table');
const Boom = require('boom');

// Query.user.create

module.exports.create = function (userRecord, callback) {

    if ((!this.db) || (!this.db._connectionOptions)) {
        const error = Boom.internal('db connection not established');
        return callback(error, null);
    }

    this.db.user.insert(userRecord, (err, key) => {

        if (err) {

            if (err.message.startsWith('Action will violate unique')) {

                const errorUnique = Boom.badRequest('uniqueness violation');
                errorUnique.output.payload.message = err.message; // @todo fix this payload issue.
                return callback(errorUnique, userRecord);
            }

            const error = Boom.internal('insert failed');
            return callback(error, userRecord);
        }

        return callback(null, key);
    });
};
