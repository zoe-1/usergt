'use strict';

const Penseur = require('penseur');
const Usergt = require('./index.js');

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
        }
    };

    // Add onConnection and onDisconnect signals.

    Config.connection.onDisconnect = () => {

        this.connected = false;
    };

    Config.connection.onConnect = () => {

        this.connected = true;
    };

    try {
    
        internals.db = new Penseur.Db(Config.dbname, Config.connection);

        const usergt = await Usergt.init(internals.db, { test: false });

        const record = await usergt.create(newUser);

        internals.db.close();

        return record;

    } catch (error) {
        
       internals.db.close();
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
    loginAttempts: 0,
    lockUntil:  Date.now() - (60 * 1000)
};

CreateUser(newUser)
    .then(async (result) => {
    
        // Get usergt object and make requests.
        // Or, load it into server.app property. 

        console.log('CreateUser result ' + result);
        // usergt.db.close();  // To imitate hapi server do not close. Closes at shutdown.
    })
    .catch((error) => {
    
        // Error messages throw and bubble up to here.
        console.log('# CreateUser error message below: \n>' + error + '\n>' + error.data);
    });

// Usergt.init()
//     .then((db) => {
//     
//         console.log('completed: ' + db);
//     })
//     .catch((error) => {
//     
//         console.log('error: ' + error);
//     });
