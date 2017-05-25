'use strict';

// const { Validate } = require('../utils');
// const Utils = require('../utils');
// const Query = require('../query');
const Tables = require('../../table');
const Penseur = require('penseur');
const Boom = require('boom');
const Config = require('../../config');
const Items = require('items');

const internals = {};

module.exports.destroy = function (documentId, callback) {

    if ((!this.db) || (!this.connected)) {
        const error = Boom.internal('db connection not established');
        return callback(error, null);
    }

    const db = this.db;

    db.user.update(documentId, { email: db.unset(), username: db.unset() }, (err) => {

        // @important unsetting a uniquely restricted field
        // removes it from the unique table which enforces uniqueness. Very cool :-)

        if (err) {
            // db.close();
            if (err.message === 'No document found') {
                const error = Boom.notFound('document to destroy does not exist');
                return callback(error, null);
            }

            const error = Boom.internal('destroy failed unset');
            return callback(error, null);
        }

        return db.user.remove(documentId, (err) => {

            if (err) {
                // db.close();
                const error = Boom.internal('destroy failed to remove');
                return callback(error, null);
            }

            // db.close();
            return callback(err, 'Destroyed document id: ' + JSON.stringify(documentId));
        });
    });
    // });
};
