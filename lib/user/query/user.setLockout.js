'use strict';

const Boom = require('boom');

module.exports.SetLockout = function (userId) {

    return new Promise(async (resolve, reject) => {

        if ((!this.db) || (!this.connected)) {
            const error = Boom.internal('db connection not established');
            return reject(error);
        }

        // initiate lockout

        const now = Date.now();
        const hours24 = (((1000 * 60) * 60) * 24);
        const lockUntil = now + hours24;

        const changeLockUntil = {
            lockUntil
        };

        await this.db.user.update(userId, changeLockUntil);

        const updatedUserDocument = await this.db.user.get(userId);

        // console.log('setLockUntil value1: ' + JSON.stringify(changeLockUntil, 0, 2));
        // console.log('setLockUntil value2: ' + JSON.stringify(updatedUserDocument, 0, 2));

        return resolve(updatedUserDocument);
    });
};
