'use strict';

const Boom = require('boom');

module.exports.FindByUsername = function (username, callback) {

    return new Promise(async (resolve, reject) => {

        if ((!this.db) || (!this.connected)) {
            const error = Boom.internal('db connection not established');
            return reject(error);
        }

        const userRecord = await this.db.user.query({ username });

        if (userRecord === null) {
            const error = Boom.notFound('username does not exist');
            return reject(error);
        }

        return resolve(userRecord[0]);
    });
};
