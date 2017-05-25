// 'use strict';
// 
// 
// const Penseur = require('penseur');
// const Usergt = require('../../lib');
// 
// const Config = {
//     dbname: 'usergt',
//     connection: {
//         host: 'localhost',
//         port: 28015
//     },
//     state: 'live',      //  live | dev defaults live.
//     purge: 'on',        //  default is 'off'.
//     admin: true         //  Boolean default false.
// };
// 
// 
// describe('destroy', () => {
// 
//     it('destroy document', (done) => {
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
//             const ConfigObject = require('../../lib/config');
// 
//             ConfigObject.purge = 'off';
//             expect(err).toBe(null);
// 
//             usergt.destroy(newUserId, (err, result) => {
// 
//                 ConfigObject.purge = 'on';
//                 return done();
//             });
//         });
//     });
// 
//     it('Query.user.destroy fail', (done) => {
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
//             const ConfigObject = require('../../lib/config');
// 
//             ConfigObject.purge = 'off';
// 
//             expect(err).toBe(null);
// 
//             const original = ConfigObject.connection.host;
//             ConfigObject.connection.host = 'boomhost';
// 
//             usergt.destroy(newUserId, (err, result) => {
// 
//                 ConfigObject.connection.host = original;
//                 ConfigObject.purge = 'on';
//                 expect(err.message).toBe('Penseur establish failed');
//                 return done();
//             });
//         });
//     });
// 
//     it('mock db.user.update fail - no document found', (done) => {
// 
//         const usergt = new Usergt.Gt(Config);
// 
//         const newUserId = 33;
// 
//         usergt.destroy(newUserId, (err, result) => {
// 
//             expect(err.message).toBe('No document found');
//             return done();
//         });
//     });
// 
//     it('mock db.user.update fail - no document found', (done) => {
// 
//         const usergt = new Usergt.Gt(Config);
// 
//         const newUserId = 33;
// 
//         const Table = require('../../lib/table');
// 
//         const Override = class extends Penseur.Table {  // use override to mock err
//             update(documentId, unsets, callback) {
// 
//                 return callback(new Error('db.user.update failed'));
//             }
//         };
// 
//         Table[Config.purge].user.extended = Override;
// 
//         usergt.destroy(newUserId, (err, result) => {
// 
//             delete Table[Config.purge].user.extended;
//             expect(err.message).toBe('destroy failed unset');
//             return done();
//         });
//     });
// 
//     it('mock db.user.remove fail', (done) => {
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
//         const ConfigObject = require('../../lib/config');
// 
//         ConfigObject.purge = 'on';
// 
//         const Table = require('../../lib/table');
// 
//         const Override = class extends Penseur.Table {  // use override to mock err
//             remove(documentId, callback) {
// 
//                 return callback(new Error('db.user.remove failed'));
//             }
//         };
// 
//         Table['off'].user.extended = Override;
// 
//         usergt.create(newUserRecord, (err, newUserId) => {
// 
//             ConfigObject.purge = 'off';
// 
//             expect(err).toBe(null);
// 
//             usergt.destroy(newUserId, (err, result) => {
// 
//                 delete Table[Config.purge].user.extended;
//                 ConfigObject.purge = 'on';
//                 expect(err.message).toBe('destroy failed to remove');
//                 return done();
//             });
//         });
//     });
// });
