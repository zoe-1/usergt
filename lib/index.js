'use strict';

const Penseur = require('penseur');
const Table = require('./table');

const { Create } = require('./user/create.js');
const { Destroy } = require('./user/destroy.js');
const { Authenticate } = require('./user/authenticate');

const internals = {};


/* init(connection)
 *
 * @db is penseur connection object
 * penseur object is created in serverPreStart on hapi then passed to usergt.
 */
const init = async (Config) => {

    // Add onConnection and onDisconnect signals.

    Config.connection.onDisconnect = () => {

        this.connected = false;
    };

    Config.connection.onConnect = () => {

        this.connected = true;
    };

    try {

        internals.db = new Penseur.Db(Config.dbname, Config.connection);

        this.name = 'usergt';
        this.db = internals.db;

        let table = Table.on;             // purge configurations on for testing (establish).
        let connectMethod = 'establish';

        if ((Config === undefined) || ((Config.test !== undefined) && (Config.test !== true)) ) {

            connectMethod = 'connect';
            this.db.table(Table.off);
            table = null;                   // purge configurations off for deployment (connection).
        }

        await this.db[connectMethod](table);

        // Set usergt.methods

        this.create = Create;
        this.destroy = Destroy;
        this.authenticate = Authenticate;
        this.close = internals.close;

        return this;

    }
    catch (error) {

        throw error;
        this.db.close();
    }
};

exports.init = init;

internals.close = () => {

    return new Promise(async (resolve, reject) => {

        try {

            await this.db.close();
            return resolve('closed dbconnection.');

        }
        catch (error) {

            return reject('failed to close db.');
        }
    });
};
