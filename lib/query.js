'use strict';

const { create }            = require('./user/query/create.query');
const { destroy }           = require('./user/query/destroy.query');
const { findByUsername }    = require('./user/query/findByUsername.query');
const { expireLockout }     = require('./user/query/expireLockout.query');
const { resetLoginAttempt } = require('./user/query/resetLoginAttempt.query');
const { incrementLoginAttempt } = require('./user/query/incrementLoginAttempt.query');

const user = {
    create,
    destroy,
    findByUsername,
    expireLockout,
    resetLoginAttempt,
    incrementLoginAttempt
};

exports.user = user;
