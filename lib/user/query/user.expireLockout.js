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

        // console.log('WATCH: JSON.strinigfy()\n' + JSON.stringify(userRecord[0]));

        if (userRecord === null) {
            const error = Boom.notFound('Expire lockout failed. username does not exist.');
            return reject(error);
        }

        // expire existing lockout

        // const now = Date.now();
        // const lockUntil = now - (60 * 1000);
        const lockUntil =  Date.now() - (60 * 1000);
        // const loginCount = 0;

        const expireLockout = {
            lockUntil
            // loginCount
        };

        await this.db.user.update(userRecord[0].id, expireLockout);

        const updatedUserDocument = await this.db.user.get(userRecord[0].id);

        // console.log('setLockUntil value1: ' + JSON.stringify(changeLockUntil, 0, 2));
        // console.log('expiredLockout value: ' + JSON.stringify(updatedUserDocument, 0, 2));

        return resolve(updatedUserDocument);
    });
};
