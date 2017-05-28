# usergt api

#### `new Usergt.gt(configs)`

Construct instance of usergt<br/>

* `configs`
  ```
  const Config = {
    dbname: String database name required. ex) 'usergt',
    connection: {
        host: String, defaults to 'localhost',
        port: Number default is 28015,
        test: Boolean optional,
        user: String defaults to 'admin' optional,
        password: String optional,
        timeout: Number defaults to 20 optional,
        reconnectTimeout: Number min(1) allows (false) defaults to 100)
    }
  } 
  ```

* Example<br/>
  ```
  // include usergt

  const User = ('path/to/usergt/lib');

  // set configs

  const Config = {
      dbname: 'usergt',
      connection: {
          host: 'localhost',
          port: 28015
      }
  };

  const usergt = User.gt(Config);

  usergt.establish((err) => {
  
        expect(err).toBe(null);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'boom@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, newUserId) => {

            expect(err).toBe(null);
            expect(newUserId.length).toBe(36);
            usergt.db.close(done);
        });
  });
  ```

#### `authenticate(username, password, callback)`
* `username` of existing user.
* `password` of existing user.
* `callback(err, authenticedUserRecord)`
  - `err` isBoom on error else null.
  - `authenticedUserRecord` userRecord of authenticated user.
* Lockout Details
  - After ten failed login attempts user account is locked for twenty four hours.<br/>
    The user account cannot be successfully authenticated until the lockout expires.

#### `create(userRecord, callback)`
* `userRecord`
  - `username`
    * must be unique
  - `password` 
    * minimum three lowercase letters
    * minimum two uppercase letters
    * minimum two digits 
    * minimum two special characters. The following are allowed: `~\`!@#$%^&*()-_+={}][|\:;"'<>.,?/`
  - `sample`<br/>
    ```
    const newUserRecord = {
        username: 'zoelogic',
        email: 'js@zoelogic.com',
        password: 'paSS-w0rd_4test',
        scope: ['user']
    };
    ```

* `callback(err, newUserId)`
  - `err` isBoom if error occured else null.
  - `newUserId` of newly created record returned.


#### `destroy(documentId, callback)`
* `documentId`
  - documentId of record to be destroyed. 
* `callback`
  - `err` isBoom if error else null.
  - `result` destroyed record message.<br/>
    `Destroyed document id: xxxx-xxxx-xxx`

#### `establish(callback)`
Sets tables configurations for penseur instance and makes database connection object.<br/>
Must be executed for usergt methods to work because it creates the db connection object
usergt methods use to make Rethinkdb queries. Thanks to penseur the connection is persisted.

* `callback(err)`
  - `err` isBoom if error else `null` upon success.
* Example
```
const Usergt = require('./lib');

const usergt = new Usergt.Gt(Config);

usergt.establish((err) => {

    expect(err).toBe(null);

    const username = 'zoelogic';
    const password = 'paSS-w0rd_4test';

    usergt.authenticate(username, password, (err, authenticedUserRecord) => {

        expect(authenticedUserRecord.username).toBe('zoelogic');
        expect(authenticedUserRecord.loginAttempts).toBe(0);
        expect(authenticedUserRecord.lockUntil).toBeLessThan(Date.now());
        return usergt.db.close(done);
    });
});
```
   
#### `expireLockout(userDocumentId, callback)`
* `userDocumentId`
  - documentId of user record to be destroyed. 
* `callback(err)`
  - `err` isBoom if error else `null` upon success.


