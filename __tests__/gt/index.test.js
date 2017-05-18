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

    it('start usergt', () => {

        const usergt = new User.Gt(Config);

        expect(usergt.name).toBe('usergt');
        expect(usergt._settings.connection.port).toBe(Config.connection.port);

        const ConfigFile = require('../../lib/config');
        expect(usergt._settings.connection.port).toBe(ConfigFile.connection.port);
    });

    it('start usergt - invalid configs', () => {

        const original = Config.dbname;
        delete Config.dbname;

        try {
            const usergt = new User.Gt(Config);
        } catch (error) {
            Config.dbname = original;
            expect(error.name).toBe('ValidationError');
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

        usergt.create(newUserRecord, (err, result) => {
        
            // console.log('watch2 ' + Object.keys(this));
            // console.log('user record: err    ' + err);
            // console.log('user record: result ' + result);
            expect(result).toBe('completed items');
            done();
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
});
