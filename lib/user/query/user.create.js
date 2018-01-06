'use strict';

const Boom = require('boom');

module.exports.Create = async function (userRecord) {

    try {

        const result = await this.db.user.insert(userRecord);
        return result;

    }
    catch (error) {

        const err = Boom.internal('Database insert failed.');
        err.data = error;
        throw err;
    }
};
