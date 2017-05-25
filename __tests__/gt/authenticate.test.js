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

    beforeEach((done) => {

        // beforeEach test 
        // * purge purge database
        // * create newUserRecord to authenticate against

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../../lib/table');

        prep.establish(Tables['on'], (err) => {  // purge tables

            expect(err).toBe(undefined);

            prep.close();

            const usergt = new Usergt.Gt(Config);

            usergt.establish((err) => {
                
                const newUserRecord = {
                    username: 'zoelogic',
                    email: 'js@zoelogic.com',
                    password: 'paSS-w0rd_4test',
                    scope: ['user']
                };

                usergt.create(newUserRecord, (err, newUserId) => {

                    expect(err).toBe(null);
                    usergt.db.close(done);
                });
            });
        });
    });

    it('authenticate document', (done) => {

        const usergt = new Usergt.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.establish((err) => {

            expect(err).toBe(null);
        
            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';


            usergt.authenticate(username, password, (err, authenticUserRecord) => {

                // expect(err).toBe(null);

                // console.log('authenticUserRecord: ' + JSON.stringify(authenticUserRecord, null, '\t'));
                return usergt.db.close(done);
                // return done();
            });
        });
    });

    it('username d/n exist', (done) => {

        const usergt = new Usergt.Gt(Config);

        const username = 'wombot';
        const password = 'paSS-w0rd_4test';

        usergt.establish((err) => {

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(404);
                expect(err.output.payload.error).toBe('Not Found');
                expect(err.message).toBe('username does not exist');
                return usergt.db.close(done);
            });
        });
    });

    it('password does not exist', (done) => {

        const usergt = new Usergt.Gt(Config);

        const username = 'zoelogic';
        const password = 'paSS-w0rd_4riit';

        usergt.establish((err) => {

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(401);
                expect(err.output.payload.error).toBe('Unauthorized');
                expect(err.message).toBe('password does not match');
                return usergt.db.close(done);
            });
        });
    });

    it('invalid password', (done) => {

        const usergt = new Usergt.Gt(Config);

        const username = 'zoelogic';
        const password = 'paSS-w0rd_riit';  // not enough integers

        usergt.establish((err) => {

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(422);
                expect(err.output.payload.error).toBe('Unprocessable Entity');
                expect(err.output.payload.message).toBe('Joi password validation failed');
                return usergt.db.close(done);
            });
        });
    });

    it('invalid username', (done) => {

        const usergt = new Usergt.Gt(Config);

        const username = '';
        const password = 'paSS-w0rd_4test';  // not enough integers

        usergt.establish((err) => {

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(422);
                expect(err.output.payload.error).toBe('Unprocessable Entity');
                expect(err.output.payload.message).toBe('Joi username validation failed');
                return usergt.db.close(done);
            });
        });
    });
 
    it('Query.user.findByUsername db.user.query failure', (done) => {

        Config.connection.test = true;

        const usergt = new Usergt.Gt(Config);

        usergt.establish((err) => {

            usergt.db.disable('user', 'query', { value: new Error('query failed') });
        
            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                delete Config.connection.test; 
                usergt.db.enable('user', 'query');

                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('db.user.query failed');
                return usergt.db.close(done);
            });
        });
    });

    it('findByUsername  - connection dropped and not reconnected yet', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            usergt.connected = false;  // mocks disconnected setting
        
            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('db connection not established');
                return usergt.db.close(done);
            });
        });
    });

// 
//     it('username invalid', (done) => {
//     
//         const usergt = new Usergt.Gt(Config);
// 
//         const newUserRecord = {
//             username: 'zoelogic',
//             email: 'js@zoelogic.com',
//             password: 'paSS-w0rd_4test',
//             scope: ['user']
//         };
// 
//         usergt.create(newUserRecord, (err, newUserId) => {
// 
//             expect(err).toBe(null);
// 
//             const ConfigObject = require('../../lib/config');
//             ConfigObject.purge = 'off';
// 
//             const username = '';
//             const password = 'paSS-w0rd_4test';
//         
//             usergt.authenticate(username, password, (err, authenticUserRecord) => {
//             
//                 ConfigObject.purge = 'on';
//                 expect(err.output.payload.message).toBe('Joi username validation failed');
//                 return done();
//             });
//         });
//     });
// 
//     it('password invalid', (done) => {
//     
//         const usergt = new Usergt.Gt(Config);
// 
//         const newUserRecord = {
//             username: 'zoelogic',
//             email: 'js@zoelogic.com',
//             password: 'paSS-w0rd_4test',
//             scope: ['user']
//         };
// 
//         usergt.create(newUserRecord, (err, newUserId) => {
// 
//             expect(err).toBe(null);
// 
//             const ConfigObject = require('../../lib/config');
//             ConfigObject.purge = 'off';
// 
//             const username = 'zoelogic';
//             const password = 'paSS-w0rd_test';
//         
//             usergt.authenticate(username, password, (err, authenticUserRecord) => {
//             
//                 ConfigObject.purge = 'on';
//                 expect(err.output.payload.message).toBe('Joi password validation failed');
//                 return done();
//             });
//         });
//     });
// 
// 
//     it('Query.user.findByUsername db.establish fails', (done) => {
//     
//         const usergt = new Usergt.Gt(Config);
// 
//         const newUserRecord = {
//             username: 'zoelogic',
//             email: 'js@zoelogic.com',
//             password: 'paSS-w0rd_4test',
//             scope: ['user']
//         };
// 
//         usergt.create(newUserRecord, (err, newUserId) => {
// 
//             expect(err).toBe(null);
// 
//             const ConfigObject = require('../../lib/config');
//             ConfigObject.purge = 'off';
//             ConfigObject.connection.host = 'boomboom';
// 
//             const username = 'zoelogic';
//             const password = 'paSS-w0rd_4test';
//         
//             usergt.authenticate(username, password, (err, authenticatedUserRecord) => {
//             
//                 ConfigObject.purge = 'on';
//                 ConfigObject.connection.host = 'localhost';
//                 // console.log('authenticatedUserRecord:    err: ' + err);
//                 // console.log('authenticatedUserRecord: result: ' + authenticatedUserRecord);
//                 // expect(err.output.payload.message).toBe('');
//                 expect(err.message).toBe('Penseur establish failed');
//                 return done();
//             });
//         });
//    });
});
