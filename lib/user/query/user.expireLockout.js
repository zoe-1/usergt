'use strict';

// const Query = require('../query');
const Boom = require('boom');

const internals = {};

module.exports.ExpireLockout = function (username) {

    return new Promise(async (resolve, reject) => {

        if ((!this.db) || (!this.connected)) {
            const error = Boom.internal('db connection not established');
            return reject(error);
        }

        const userRecord = await this.db.user.query({ username });

        if (userRecord === null) {
            const error = Boom.notFound('Expire lockout failed. username does not exist.');
            return reject(error);
        }

        // expire existing lockout

        const lockUntil =  Date.now() - (60 * 1000);

        const expireLockout = {
            lockUntil
        };

        await this.db.user.update(userRecord[0].id, expireLockout);

        const updatedUserDocument = await this.db.user.get(userRecord[0].id);

        return resolve(updatedUserDocument);
    });
};
