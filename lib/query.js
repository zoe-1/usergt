'use strict';

const { Create } = require('./user/query/create.query');
const { Destroy } = require('./user/query/destroy.query');

// All user logic in user object :-)

const user = {};
user.create = Create;
user.destroy = Destroy;
exports.user = user;
