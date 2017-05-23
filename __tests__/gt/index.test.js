'use strict';


const User = require('../../lib');

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




describe('lib/index', () => {

    it('start usergt', (done) => {

        const usergt = new User.Gt(Config);

        expect(usergt.name).toBe('usergt');
        expect(usergt._settings.connection.port).toBe(Config.connection.port);

        const ConfigFile = require('../../lib/config');
        expect(usergt._settings.connection.port).toBe(ConfigFile.connection.port);
        done();
    });

    it('start usergt - invalid configs', (done) => {

        const original = Config.dbname;
        delete Config.dbname;

        try {
            const usergt = new User.Gt(Config);
        } catch (error) {
            Config.dbname = original;
            expect(error.name).toBe('ValidationError');
            return done();
        }
    });

    it('start usergt - create loaded', (done) => {

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        return usergt.create(newUserRecord, (err, result) => {
        
            expect(err).toBe(null);
            expect(result.length).toBe(36);
            return done();
        });
    });

    it('mock validate error', (done) => {

        const User = require('../../lib');

        const original = User.utils.validate.user;

        User.utils.validate.user = function (userRecord, callback) {

            User.utils.validate.user = original;
            return callback(new Error('mock validation failure'), 'boom2');
        };

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, result) => {
        
            // console.log('watch3 ' + Object.keys(this));
            // console.log('user record: err    ' + err);
            // console.log('user record: result ' + result);
            expect(err.message).toBe('mock validation failure');
            done();
        });
    });

    it('Joi invalid data', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_test', // pw invalid
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, result) => {
        
            expect(err.message).toBe('Joi validation failed');
            done();
        });
    });

    it('mock bcrypt genSalt failure', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        const Bcrypt = require('bcrypt');
        const original = Bcrypt.genSalt;

        Bcrypt.genSalt = function (saltWorkFactor, callback) {

            Bcrypt.genSalt = original;
            return callback(new Error('mock bcrypt genSalt failure'), null);
        };
        
        usergt.create(newUserRecord, (err, result) => {
        
            expect(err.message).toBe('bcrypt genSalt failed');
            done();
        });
    });

    it('mock bcrypt hash failure', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        const Bcrypt = require('bcrypt');
        const original = Bcrypt.hash;

        Bcrypt.hash = function (plainText, salt, callback) {

            Bcrypt.hash = original;
            return callback(new Error('mock bcrypt hash failure'), null);
        };
        
        usergt.create(newUserRecord, (err, result) => {
        
            expect(err.message).toBe('bcrypt hash failed');
            done();
        });
    });

    it('mock Query.user.create err', (done) => {

        const User = require('../../lib');

        const original = User.Query.user.create;

        User.Query.user.create = function (userRecord, callback) {

            User.Query.user.create = original;
            return callback(new Error('mock Query.user.create failure'), null);
        };

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, result) => {
        
            expect(err.message).toBe('mock Query.user.create failure');
            done();
        });
    });

    it('mock Query.user.create db.establish failure', (done) => {

        const User = require('../../lib');

        const original = Config.connection.host;

        Config.connection.host = 'boomhost';

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, result) => {
        
            // console.log('Error Message: ' + err.message);
            Config.connection.host = original;
            // expect(err.message).toBe('mock Query.user.create failure');
            done();
        });
    });

    it('mock Query.user.create violates unique restriction', (done) => {

        const User = require('../../lib');

        const original = Config.connection.host;

        // Config.connection.host = 'boomhost';
        // console.log(JSON.stringify(Config));
        // console.log(Object.keys(usergt));

        const usergt1 = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        return usergt1.create(newUserRecord, (err, result) => {
        
            expect(err).toBe(null);

            Config.purge = 'off';

            const usergt2 = new User.Gt(Config);

            const newUserRecord2 = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            return usergt2.create(newUserRecord2, (err, result) => {
            
                Config.purge = 'on';
                expect(err.message).toBe('uniqueness violation');
                expect(err.output.payload.statusCode).toBe(400);
                expect(err.output.payload.error).toBe('Bad Request');
                return done();
            });
        });
    });

    it('mock Query.user.create db.user.insert error (extended)', (done) => {

        const Penseur = require('penseur');

        const Table = require('../../lib/table');

        const Override = class extends Penseur.Table {  // use override to mock err
            insert(userRecord, callback) {

                return callback(new Error('db.user.insert failed'));
            }
        };

        Table[Config.purge].user.extended = Override;

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, result) => {
        
            delete Table[Config.purge].user.extended; 
            expect(err.output.payload.statusCode).toBe(500);
            expect(err.output.payload.error).toBe('Internal Server Error');
            expect(err.message).toBe('insert failed');
            done();
        });
    });

    it('mock Query.user.create err', (done) => {

        const User = require('../../lib');

        const original = User.Query.user.create;

        User.Query.user.create = function (userRecord, callback) {

            User.Query.user.create = original;
            return callback(new Error('mock Query.user.create failure'), null);
        };

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, result) => {
        
            expect(err.message).toBe('mock Query.user.create failure');
            done();
        });
    });
});
