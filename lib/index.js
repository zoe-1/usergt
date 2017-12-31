'use strict';

const Penseur = require('penseur');

const { Create } = require('./user/create.js');  

const internals = {};

const Table = {
    on: {  // purge on || off.
        penseur_unique_user_username: true,             // dev cleanup: true purges the table.
        penseur_unique_user_email: true,                // dev cleanup: true purges the table.
        user: {
            id: 'uuid',
            unique: [
            { path: ['username'] },
            { path: ['email'] }
            ]
        }
    },
    off: { // purge on || off.
        penseur_unique_user_username: false,             // live false no cleanup d/n purge
        penseur_unique_user_email: false,                // live false no cleanup d/n purge
        user: {
            id: 'uuid',
            unique: [
            { path: ['username'] },
            { path: ['email'] }
            ],
            purge: false                                // false no cleanup d/n purge
        }
    },
    penseur_unique_user_username: { penseur_unique_user_username: { purge: false } }, // config for getting tests.
    penseur_unique_user_email: { penseur_unique_user_email: { purge: false } }
};


/* init(connection) 
 *
 * @db is penseur connection object
 * penseur object is created in serverPreStart on hapi then passed to usergt.
 */
const init = async (db, options) => {

    try {
    
        this.name = 'usergt';
        this.db = db;

        let table = Table['on'];             // purge configurations on for testing (establish).
        let connectMethod = 'establish';

        if ((options === undefined) || ((options.test !== undefined) && (options.test !== true)) ) {
            
            connectMethod = 'connect';
            this.db.table(Table['off']);
            table = null;                   // purge configurations off for deployment (connection).
        }

        await this.db[connectMethod](table);

        // Set usergt.methods

        this.create = Create;

        return this;

    } catch (error) {

        throw error;
        this.db.close();
    }
};

exports.init = init;
