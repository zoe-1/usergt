'use strict';

const Config = require('../../config');
const Penseur = require('penseur');
const Tables = require('../../table');
const Boom = require('boom');

// Query.user.findByUsername

module.exports.findByUsername = function (username, callback) {

    const db = new Penseur.Db(Config.dbname, Config.connection);

    return db.establish(Tables[Config.purge], (err) => {

        if (err) {
            const error = Boom.internal('Penseur establish failed');
            error.output.payload.message = 'Penseur establish failed';
            return callback(error, null);
        }

        return db.user.query({ username }, (err, userRecord) => {

            if (err) {
                const error = Boom.internal('db.user.query failed');
                db.close();
                return callback(error, null);
            }

            if (userRecord === null) {
                const error = Boom.badRequest('username does not exist');
                db.close();
                return callback(error, null);
            }

            db.close();
            return callback(null, userRecord[0]);
        });
    });
};
