'use strict';

const Penseur = require('penseur');
const Usergt = require('../../lib');

const Config = {
    dbname: 'usergt',
    connection: {
        host: 'localhost',
        port: 28015
    },
    state: 'live',      //  live | dev defaults live.
    purge: 'on',        //  default is 'off'.
    admin: true         //  Boolean default false.
};



describe('authenticate', () => {

    it('authenticate document', (done) => {
    
        const usergt = new Usergt.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, newUserId) => {

            expect(err).toBe(null);

            const ConfigObject = require('../../lib/config');
            ConfigObject.purge = 'off';

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';
        
            usergt.authenticate(username, password, (err, authenticUserRecord) => {
            
                ConfigObject.purge = 'on';
                // console.log('authenticUserRecord: ' + JSON.stringify(authenticUserRecord, null, '\t'));
                return done();
            });
        });
    });

    it('mock findByUsername db.user.query failure', (done) => {
    
        const usergt = new Usergt.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        const Table = require('../../lib/table');
        const ConfigObject = require('../../lib/config');

        const Override = class extends Penseur.Table {  // use override to mock err
            query(username, callback) {

                return callback(new Error('db.user.query failed'));
            }
        };

        Table['off'].user.extended = Override;

        usergt.create(newUserRecord, (err, newUserId) => {

            expect(err).toBe(null);

            ConfigObject.purge = 'off';

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {
            
                delete Table[ConfigObject.purge].user.extended;
                ConfigObject.purge = 'on';
                expect(err.message).toBe('db.user.query failed');
                return done();
            });
        });
    });

    it('username invalid', (done) => {
    
        const usergt = new Usergt.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, newUserId) => {

            expect(err).toBe(null);

            const ConfigObject = require('../../lib/config');
            ConfigObject.purge = 'off';

            const username = '';
            const password = 'paSS-w0rd_4test';
        
            usergt.authenticate(username, password, (err, authenticUserRecord) => {
            
                ConfigObject.purge = 'on';
                expect(err.output.payload.message).toBe('Joi username validation failed');
                return done();
            });
        });
    });

    it('password invalid', (done) => {
    
        const usergt = new Usergt.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, newUserId) => {

            expect(err).toBe(null);

            const ConfigObject = require('../../lib/config');
            ConfigObject.purge = 'off';

            const username = 'zoelogic';
            const password = 'paSS-w0rd_test';
        
            usergt.authenticate(username, password, (err, authenticUserRecord) => {
            
                ConfigObject.purge = 'on';
                expect(err.output.payload.message).toBe('Joi password validation failed');
                return done();
            });
        });
    });

    it('Query.user.findByUsername username d/n exist', (done) => {
    
        const usergt = new Usergt.Gt(Config);

        const username = 'wombot';
        const password = 'paSS-w0rd_4test';
    
        usergt.authenticate(username, password, (err, authenticatedUserRecord) => {
        
            expect(err.message).toBe('username does not exist');
            return done();
        });
    });

    it('Query.user.findByUsername db.establish fails', (done) => {
    
        const usergt = new Usergt.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, newUserId) => {

            expect(err).toBe(null);

            const ConfigObject = require('../../lib/config');
            ConfigObject.purge = 'off';
            ConfigObject.connection.host = 'boomboom';

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';
        
            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {
            
                ConfigObject.purge = 'on';
                ConfigObject.connection.host = 'localhost';
                // console.log('authenticatedUserRecord:    err: ' + err);
                // console.log('authenticatedUserRecord: result: ' + authenticatedUserRecord);
                // expect(err.output.payload.message).toBe('');
                expect(err.message).toBe('Penseur establish failed');
                return done();
            });
        });
    });
});
