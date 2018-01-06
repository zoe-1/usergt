'use strict';

const Boom = require('boom');


module.exports.ResetLoginCount = function (userId) {

    return new Promise(async (resolve, reject) => {

        if ((!this.db) || (!this.connected)) {
            const error = Boom.internal('db connection not established');
            return reject(error);
        }

        const loginCount = 0;

        await this.db.user.update(userId, { loginCount }); const updatedUserDocument  = await this.db.user.get(userId);

        return resolve(updatedUserDocument);
    });
};
