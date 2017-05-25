'use strict';

// const { Validate } = require('../utils');
const Utils = require('../utils');
const Query = require('../query');
const Penseur = require('penseur');
const Boom = require('boom');
const Config = require('../config');
const Items = require('items');

const internals = {};

module.exports.Create = function (userRecord, callback) {

    Utils.validate.user.call(this, userRecord, (err, validatedRecord) => {

        if (err) {
            return callback(err, null);
        }

        const plainTextPassword = validatedRecord.password;

        Utils.bcrypt.hash.call(this, plainTextPassword, (err, hashedPassword) => {

            if (err) {
                return callback(err, null);
            }

            validatedRecord.password = hashedPassword;

            Query.user.create.call(this, validatedRecord, (err, result) => {

                if (err) {
                    return callback(err, null);
                }

                return callback(null, result);
            });
        });
    });
};
