'use strict';

const Config = require('../../config');
const Penseur = require('penseur');
const Tables = require('../../table');
const Boom = require('boom');

// Query.user.create

module.exports.Create = function (userRecord, callback) {

    const db = new Penseur.Db(Config.dbname, Config.connection);

    db.establish(Tables[Config.purge], (err) => {

        if (err) {

            const error = Boom.internal('Penseur establish failed');
            error.output.payload = err; // Penseur Boom error object.
            db.close();
            return callback(error, null);
        }

        return db.user.insert(userRecord, (err, key) => {

            if (err) {

                if (err.message.startsWith('Action will violate unique')) {

                    const errorUnique = Boom.badRequest('uniqueness violation');
                    // console.log('WATCH1 ' + err.message);
                    errorUnique.output.payload.message = err.message; // @todo fix this payload issue.
                    // console.log(JSON.stringify(err, null, '\t'));
                    db.close();
                    return callback(errorUnique, userRecord);
                }

                const error = Boom.internal('insert failed');
                db.close();
                return callback(error, userRecord);
            }

            db.close();
            return callback(null, key);
        });
    });
};
