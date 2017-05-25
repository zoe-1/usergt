'use strict';

// const Boom = require('boom');
// // const Config = require('../../config');
// const Penseur = require('penseur');
// const Tables = require('../../lib/table');
// 
// 
// const Config = {
//     dbname: 'usergt',
//     connection: {
//         host: 'localhost',
//         port: 28015,
//         reconnect: true 
//     },
//     state: 'live',      //  live | dev defaults live.
//     purge: 'on',        //  default is 'off'.
//     admin: true         //  Boolean default false.
// };
// 
// 
// 
// describe.only('connection', () => {
// 
//     it('set reconnection function', (done) => {
// 
//         // const Usergt = require('../../lib');
//         // console.log(JSON.stringify(Config, null, '\t'));
// 
//         const db = new Penseur.Db(Config.dbname, Config.connection);
// 
//         db.establish(Tables[Config.purge], (err) => {
//         
//             // console.log('WATCH3 db.establish cleanup completed');
// 
//             console.log('INSPECT: db._connection BEFORE ' + Object.keys(db._connection));
//             console.log('INSPECT: host BEFORE  ' + db._connection.host);
//             console.log('INSPECT: port BEFORE  ' + db._connection.port);
//             console.log('INSPECT: open BEFORE  ' + db._connection.open);
//             console.log('INSPECT: closing BEFORE   ' + db._connection.closing);
//             console.log('INSPECT: _connectionOptions BEFORE ' + Object.keys(db._connectionOptions));
//             db.close();
//             console.log('INSPECT: db._connection AFTER  ' + Object.keys(db._connection));
//             console.log('INSPECT: host AFTER   ' + db._connection.host);
//             console.log('INSPECT: port AFTER   ' + db._connection.port);
//             console.log('INSPECT: open AFTER   ' + db._connection.open);
//             console.log('INSPECT: closing AFTER   ' + db._connection.closing);
//             console.log('INSPECT: db  ' + Object.keys(db));
//             console.log('INSPECT: _connectionOptions AFTER ' + db._connectionOptions);          // _connectionOptions are null after close()
//             // console.log('INSPECT: _connectionOptions AFTER ' + !db._connectionOptions);
//             return done();
//         });
//     });
// });
