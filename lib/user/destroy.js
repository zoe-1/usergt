'use strict';

// const { Validate } = require('../utils');
// const Utils = require('../utils');
const Query = require('../query');
const Penseur = require('penseur');
const Boom = require('boom');
const Config = require('../config');
const Items = require('items');

const internals = {};

module.exports.Destroy = function (documentId, callback) {

    Query.user.destroy.call(this, documentId, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};
