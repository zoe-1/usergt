'use strict';


const Hoek = require('hoek');
const Penseur = require('penseur');
const User = require('../../lib');

const Config = {
    dbname: 'usergt',
    connection: {
        host: 'localhost',
        port: 28015
    }
};


describe('lib/index', () => {

    beforeEach((done) => {

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../../lib/table');

        prep.establish(Tables['on'], (err) => {  // purge tables

            expect(err).toBe(undefined);
            prep.close(done);
            // return done();
        });
    });

    it('success establish', (done) => {

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {
        
            expect(usergt.name).toBe('usergt');
            expect(usergt._settings.connection.port).toBe(Config.connection.port);
            usergt.db.close(done);
        }); 
    });

    it('start - invalid configs', (done) => {

        const original = Config.dbname;
        delete Config.dbname;

        try {
            const usergt = new User.Gt(Config);
        } catch (error) {

            Config.dbname = original;

            expect(error.isJoi).toBe(true);
            expect(error.name).toBe('ValidationError');
            return done();
        }
    });

    it('db.connect failure', (done) => {

        const User = require('../../lib');

        const original = Config.connection.host;

        Config.connection.host = 'boomhost';

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            Config.connection.host = original;
            expect(err.name).toBe('ReqlDriverError');
            return done();
        });
    });

    it('force reconnect', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.establish((err) => {

            usergt.db._connection.close(Hoek.ignore);

            usergt.create(newUserRecord, (err, result) => {
            
                expect(result.length).toBe(36);
                return usergt.db.close(done);
            });
        });
    });
});
