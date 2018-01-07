'use strict';

module.exports.IncrementLoginAttempt = function (userId) {

    return new Promise(async (resolve, reject) => {

        const changes = {
            loginCount: this.db.increment(1)
        };

        await this.db.user.update(userId, changes);

        const incrementedUserDocument = await this.db.user.get(userId);

        // console.log('incrementedUserDocument: ' + JSON.stringify(incrementedUserDocument));
        // return reject(new Error('boom testx'));
        return resolve(incrementedUserDocument);
    });
};
