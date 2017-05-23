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

    const db = new Penseur.Db(Config.dbname, Config.connection);

    db.establish(Tables[Config.purge], (err) => {

        if (err) {

            const error = Boom.internal('Penseur establish failed');
            error.output.payload = err; // Penseur Boom error object.
            db.close();
            return callback(error, null);
        }

        return db.user.update(documentId, { email: db.unset(), username: db.unset() }, (err) => {

            // @important unsetting a uniquely restricted field
            // removes it from the unique table which enforces uniqueness. Very cool :-)

            if (err) {
                db.close();
                if (err.message === 'No document found') {
                    return callback(err, null);
                }

                const error = Boom.internal('destroy failed unset');
                return callback(error, null);
            }

            return db.user.remove(documentId, (err) => {

                if (err) {
                    db.close();
                    const error = Boom.internal('destroy failed to remove');
                    return callback(error, null);
                }

                db.close();
                return callback(err, 'Destroyed document id: ' + JSON.stringify(documentId));
            });
        });
    });
};
