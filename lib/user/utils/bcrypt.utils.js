'use strict';

const Boom = require('boom');
const Bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 12;

module.exports.Hash = (plainTextPassword, callback) => {

    Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {

        if (err) {
            const error = Boom.internal('bcrypt genSalt failed');
            return callback(error, null);
        };

        Bcrypt.hash(plainTextPassword, salt, (err, hashedPassword) => {

            if (err) {
                const error = Boom.internal('bcrypt hash failed');
                return callback(error, null);
            };

            return callback(null, hashedPassword);
        });

    });
};

module.exports.Compare = (plainTextPassword, hash, callback) => {

    Bcrypt.compare(plainTextPassword, hash, (err, res) => {

        // res true || false.

        return callback(err, res);
    });
};
