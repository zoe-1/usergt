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

            return Utils.user.checkLockout.call(this, userDocument, (err, locked) => {

                 if (locked) {
                     const error = Boom.forbidden('account locked');
                     return callback(error, null);
                 }

                 if (err) {
                     return callback(err, null);
                 }
            
                 return Utils.bcrypt.compare.call(this, password, userDocument.password, (err, validPw) => {

                     if (validPw) {

                         // valid password - resetLoginAttempts

                         return Query.user.resetLoginAttempt.call(this, userDocument.id, (err, authenticatedUserDocument) => {

                             // console.log('success resetLoginAttempt');
                             return callback(null, authenticatedUserDocument);
                         });
                     }

                     // invalid password

                     return Query.user.incrementLoginAttempt.call(this, userDocument.id, (err, userDocument) => {   // do lockout work inside here.

                         if (err) {
                             return callback(err, userDocument);
                         }

                         const error = Boom.unauthorized('password does not match');
                         return callback(error, userDocument);
                     });
                     // return callback(null, 'endAuthenticate');
                 });
            });
        });
    });
};
