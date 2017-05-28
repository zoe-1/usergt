# usergt api

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

#### `authenticate(username, password, callback)`
* `username` of existing user.
* `password` of existing user.
* `callback(err, authenticedUserRecord)`
  - `err` isBoom on error else null.
  - `authenticedUserRecord` userRecord of authenticated user.
* Lockout Details
  - After ten failed login attempts user account is locked for twenty four hours.<br/>
    The user account cannot be successfully authenticated until the lockout expires.
   

   
