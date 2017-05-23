'use strict';

const { create }            = require('./user/query/create.query');
const { destroy }           = require('./user/query/destroy.query');
const { findByUsername }    = require('./user/query/findByUsername.query');

const user = {
    create,
    destroy,
    findByUsername
};

exports.user = user;
