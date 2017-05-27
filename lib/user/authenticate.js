'use strict';

// const { Validate } = require('../utils');
const Utils = require('../utils');
const Query = require('../query');
const Penseur = require('penseur');
const Boom = require('boom');
const Config = require('../config');
const Items = require('items');

const internals = {};

module.exports.Authenticate = function (username, password, callback) {

    Utils.validate.usernamePassword.call(this, username, password, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return Query.user.findByUsername.call(this, username, (err, userDocument) => {

            if (err) {
                return callback(err, null);
            }

            return Utils.user.checkLockout.call(this, userDocument, (locked) => {

                if (locked) {
                    const error = Boom.forbidden('account locked');
                    return callback(error, null);
                }

                return Utils.bcrypt.compare.call(this, password, userDocument.password, (err, validPw) => {

                    if (validPw) {

                        return Query.user.resetLoginAttempt.call(this, userDocument.id, (err, authenticatedUserDocument) => {

                            if (err) {
                                return callback(err, null);  // internal errors
                            }

                            return callback(null, authenticatedUserDocument);
                        });
                    }

                    // invalid password

                    return Query.user.incrementLoginAttempt.call(this, userDocument.id, (err, userDocument) => {

                        if (err) {
                            return callback(err, userDocument);  // internal errors
                        }

                        if (userDocument.loginAttempts >= 10) {

                            return Query.user.setLockout.call(this, userDocument.id, (err, userDocument) => {

                                if (err) {
                                    return callback(err, null); // internal errors
                                }

                                const error = Boom.unauthorized('password incorrect (started lockout)');
                                return callback(error, userDocument);
                            });
                        }

                        const error = Boom.unauthorized('password incorrect');
                        return callback(error, userDocument);

                    });
                    // return callback(null, 'endAuthenticate');
                });
            });
        });
    });
};
