'use strict';

const Boom = require('boom');
const Utils = require('./utils');
const Query = require('./query/index');

module.exports.Authenticate = async function (username, password) {

    // console.log('::STARTING authenticate::');

    let userDocument;

    try {

        await Utils.validate.usernamePassword.call(this, username, password);

        userDocument = await Query.user.findByUsername.call(this, username);

        await Utils.user.checkLockout.call(this, userDocument);  // enforces lockout here.

        const validPw = await Utils.bcrypt.compare.call(this, password, userDocument.password);

        if (validPw) {

            const authenticatedUser = await Query.user.resetLoginCount.call(this, userDocument.id);
            delete authenticatedUser.password;
            return authenticatedUser;
        }

        userDocument = await Query.user.incrementLoginAttempt.call(this, userDocument.id);


        if (userDocument.loginCount >= 10) {

            // console.log('### WATCH TARGET' + userDocument.loginCount);

            await Query.user.setLockout.call(this, userDocument.id); // configure lockout settings.

            // console.log('>\n>\n>Start watch lockedOutUserDocument \n>' + lockedOutUserDocument + '\n>\n> End watch lockedOutUserDocument\n>');

            throw  Boom.unauthorized('password incorrect (started lockout)');
        }

        // console.log('::Boom password incorrect  authenticate::');
        // console.log('%c\n>\n> # Start watch password incorrect.\n>\n' + JSON.stringify(userDocument, 0, 2) + '\n>\n># End watch password incorrect.\n>\n');

        throw  Boom.unauthorized('password incorrect');

    }
    catch (error) {

        // console.log('ERROR WATCH authenticate CATCH: ' + JSON.stringify(error, 0, 2));

        if (error.output.statusCode === 401) {

            // console.log('Unauthorized  CATCH: ' + error); // password incorrect
            throw error;

        }
        else if (error.output.statusCode === 404) {

            // console.log('Not Found CATCH: ' + error);
            throw error;
        }

        throw error;
    }
};
