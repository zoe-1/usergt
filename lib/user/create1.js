'use strict';

// create1.js
// items design

// const { Validate } = require('../utils');
const Utils = require('../utils');
const Penseur = require('penseur');
const Boom = require('boom');
const Config = require('../config');
const Items = require('items');

const internals = {};

module.exports.Create = function (userRecord, callback) {

    const createInternals = {
        action: { name: 'actionName', value: 'actionPayload' }, 
        db: {}
    };

    createInternals.action.name = 'validateUserRecord';
    createInternals.action.value = userRecord;

    const actions = [];

    const validate = function (next, i) {

        Utils.validate.user(userRecord, (err, validatedRecord) => {
        
            if (err) {
                return next(err);
            }

            createInternals.action.name = 'hashPassword';
            createInternals.action.value = validatedRecord;
            return next();
        });
    };


    actions.push(validate);

    const hashPassword = function (next, i) {
    
        const plainTextPassword = createInternals.action.value.password;

        Utils.bcrypt.hash(plainTextPassword, (err, hashedPassword) => {

            if (err) {
                return next(err);
            }

            createInternals.action.name = 'insertRecord';
            createInternals.action.value.password = hashedPassword;
            return next();
        });
    };

    actions.push(hashPassword);


    const each = (item, next, i) => item(next, i);

    Items.serial(actions, each, (err) => {

        if (err) {
            // console.log('done Items had error: ' + JSON.stringify(err, null, '\t'));
            return callback(err, null);
        }

        // console.log('done Items ' + JSON.stringify(createInternals, null, '\t'));
        return callback(null, 'completed items');
    });

};
