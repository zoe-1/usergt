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

    return Utils.validate.usernamePassword(username, password, (err, result) => {

        if (err) {
            return callback(err, null); 
        }

        return Query.user.findByUsername(username, (err, userDocument) => {
        
            if (err) {
                return callback(err, null); 
            }

            // return Utils.user.checkLockout(userDocument, (err, locked) => {
            // 
            //     if (locked) {
            //         // account locked 
            //         const error = Boom.forbidden('account locked');
            //         return callback(error, null);
            //     }

            //     return callback(null, 'finished!!!');
            // });
            return callback(null, 'finished!!!');
        });
    
        // return Query.user.findByUsername(username, (err, userDocument) => {
        // 
        //     return Utils.user.checkLockout(userDocument, (err, lockoutStatus) => {

        //         return Utils.user.comparePassword(password, (err, passwordCorrect) => {  // passwordCorrect Boolean
        //         
        //             if (passwordCorrect) {  // successful login

        //                 return Utils.user.resetLoginAttempt(userId, (err, authenticatedUserDocument) => {  // passwordCorrect Boolean

        //                     return callback(null, authenticatedUserDocument);
        //                 });
        //             }

        //             // password incorrect

        //             return Utils.user.incrementLoginAttempt(userId, (err, lockoutStatus) => {   // do lockout work inside here.

        //                 return callback(Boom.unauthorized, result);
        //             });
        //         });
        //     });
        // });
    });
};
