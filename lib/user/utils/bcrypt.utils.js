'use strict';

const Boom = require('boom');
const Bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 12;

module.exports.Hash = (userRecord, callback) => {

    return new Promise((resolve, reject) => {

        return Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {

            if (err) {
                const error = Boom.internal('bcrypt genSalt failed');
                error.data = err;
                return reject(error);
            };

            return Bcrypt.hash(userRecord.password, salt, (err, hashedPassword) => {

                if (err) {
                    const error = Boom.internal('bcrypt hash failed');
                    error.data = err;
                    return reject(error, null);
                };

                userRecord.password = hashedPassword;

                return resolve(userRecord);
            });
        });
    });
};

module.exports.Compare = (plainTextPassword, hash) => {

    return new Promise((resolve, reject) => {

        Bcrypt.compare(plainTextPassword, hash, (err, res) => {

            // res true || false.

            if (err) {

                const error = Boom.internal('bcrypt compare failed');
                return reject(error);
            }

            return resolve(res);
        });
    });
};
