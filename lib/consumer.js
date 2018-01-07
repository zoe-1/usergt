'use strict';

const Usergt = require('./index.js');
const Items = require('items');
const Hoek = require('hoek');
const Query = require('./user/query/index.js');

const internals = {};

// consumer application to build app.

const CreateUser = async (newUser) => {

    // Build penseur object outside of usergt
    // to imitate generating the object on pre-start event
    // and closing in post-stop event.

    const Config = {
        dbname: 'usergt',
        connection: {
            host: 'localhost',
            port: 28015
        },
        test: true
    };

    try {

        const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

        const record = await usergt.create(newUser);

        await usergt.close();

        return record;

    }
    catch (error) {

        internals.usergt.close();
        throw error;
    }
};


const newUser = {
    username: 'zoelogic',
    email: 'zoe@zoelogic.com',
    password: 'BiSyy44_+556677',
    // password: 'dasfadsf',
    scope: ['user', 'admin'],
    created: Date.now(),
    loginCount: 0,
    lockUntil:  Date.now() - (60 * 1000)
};

// CreateUser(newUser)
//     .then(async (result) => {
//
//         // Get usergt object and make requests.
//         // Or, load it into server.app property.
//
//         console.log('CreateUser result ' + result);
//         // usergt.db.close();  // To imitate hapi server do not close. Closes at shutdown.
//     })
//     .catch((error) => {
//
//         // Error messages throw and bubble up to here.
//         console.log('# CreateUser error message below: \n>' + error + '\n>' + error.data);
//     });


// const DestroyUser = async (newUser) => {
//
//     // Build penseur object outside of usergt
//     // to imitate generating the object on pre-start event
//     // and closing in post-stop event.
//
//     const Config = {
//         dbname: 'usergt',
//         connection: {
//             host: 'localhost',
//             port: 28015
//         },
//         test: true
//     };
//
//     try {
//
//         const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.
//
//         const recordId = await usergt.create(newUser);                    // Consume usergt.
//         console.log('created new record id: ' + recordId);
//
//         const result = await usergt.destroy(recordId);       // Consume usergt.
//
//         await usergt.close();                            // Server shutdown.
//
//         return result;
//
//     } catch (error) {
//
//        internals.usergt.close();
//
//        throw error;
//     }
// };


// DestroyUser(newUser)
//     .then(async (result) => {
//
//         // Get usergt object and make requests.
//         // Or, load it into server.app property.
//
//         console.log('# DestroyUser result \n' + result);
//         // usergt.db.close();  // To imitate hapi server do not close. Closes at shutdown.
//     })
//     .catch((error) => {
//
//         // Error messages throw and bubble up to here.
//         console.log('# DestroyUser error message below: \n>' + error + '\n>' + error.data);
//     });



const AuthenticateUser = async (username, password) => {

    // Build penseur object outside of usergt
    // to imitate generating the object on pre-start event
    // and closing in post-stop event.

    const Config = {
        dbname: 'usergt',
        connection: {
            host: 'localhost',
            port: 28015
        },
        test: false
    };

    try {

        const usergt = internals.usergt = await Usergt.init(Config);        // Done at startup.

        // const recordId = await usergt.create(newUser);                    // Consume usergt.

        const result = await usergt.authenticate(username, password);                      // Consume usergt.

        await usergt.close();                                               // Server shutdown.

        return result;

    }
    catch (error) {

        console.log('authenticate error: ' + error);

        internals.usergt.close();

        throw error;
    }
};

// const newUserRecord = {
//     username: 'zoelogic',
//     email: 'js@zoelogic.com',
//     password: 'BiSyy44_+556677',
//     scope: ['user']
// };

// AuthenticateUser(newUserRecord.username, newUserRecord.password)
//     .then(async (result) => {
//
//         // Get usergt object and make requests.
//         // Or, load it into server.app property.
//
//         console.log('# AuthenticateUser result \n' + JSON.stringify(result));
//
//         // usergt.db.close();  // To imitate hapi server do not close. Closes at shutdown.
//     })
//     .catch((error) => {
//
//         // Error messages throw and bubble up to here.
//         console.log('# AuthenticateUser error message below: \n>' + error + '\n>' + error.data);
//     });

const badUserRecord = {
    username: 'zoelogic',
    email: 'js@zoelogic.com',
    password: 'BiSyy44_+559988',
    scope: ['user']
};

const badAttempt = function (item, next, i) {

    return AuthenticateUser(badUserRecord.username, badUserRecord.password)
        .then((result) => {

            // Get usergt object and make requests.
            // Or, load it into server.app property.

            console.log('# AuthenticateUser result \n' + JSON.stringify(result));
            return next();

            // usergt.db.close();  // To imitate hapi server do not close. Closes at shutdown.
        })
        .catch((error) => {

            // Error messages throw and bubble up to here.
            console.log('# AuthenticateUser error message below: \n>' + error + '\n>' + error.data);
            return next();
        });
};

// one bad attempt

// badAttempt();

const InitiateLockout = async function () {

    const newUserRecord = await CreateUser(newUser);

    console.log('WATCH here: ' + newUserRecord);

    Items.serial([1,2,3,4,5,6,7,8,9,10], badAttempt, async (err) => {

        Hoek.assert(err === undefined, 'Items threw an error. See next line: \n' + err);

        const Config = {
            dbname: 'usergt',
            connection: {
                host: 'localhost',
                port: 28015
            },
            test: false
        };

        const usergt = await Usergt.init(Config);        // Done at startup.

        const userDocument = await Query.user.findByUsername.call(usergt, badUserRecord.username);

        usergt.close();

        console.log('FINISHED VIEW userdoc: ' + JSON.stringify(userDocument, 0, 2));

    });
};


InitiateLockout();
