# usergt api

- [example](#example)
- [configs](#config)
- [authenticate](#authenticate)
- [create](#create)
- [destroy](#destroy)
- [expireLockout](#expirelockout)
- [usergt](#usergt)


#### `config()`

Construct instance of usergt<br/>

* `configs()`
  ```
    const Config = {
        dbname: 'usergt',
        connection: {
            host: 'localhost',
            port: 28015
        },
        test: true
    };
  ```

#### `example()`
 * Example
   ```js
   // include usergt
 
   const Usergt = ('path/to/usergt/lib');
 
   const Config = {
       dbname: 'usergt',
       connection: {
           host: 'localhost',
           port: 28015
       },
       test: true
   };
 
   try {
 
        const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.
 
        const record = await usergt.create(newUser);
 
        await usergt.close();
 
        expect(record.length).to.equal(36);
   }
        catch (error) {
 
            internals.usergt.close();
            throw error;
   }
   ```

#### `authenticate()` 

`await usergt.authenticate(username, password)`
* `username` of existing user.
* `password` of existing user.
* Lockout Details
  - After ten failed login attempts user account is locked for twenty four hours.<br/>
    The user account cannot be successfully authenticated until the lockout expires.


#### `create()` 
* `await usergt.create(userRecord)`
* `userRecord`
  - `sample`<br/>
    ```js
    const newUser = {
        username: 'zoelogic',
        email: 'zoe@zoelogic.com',
        password: 'BiSyy44_+556677',
        // password: 'dasfadsf',
        scope: ['user', 'admin'],
        created: Date.now(),
        loginCount: 0,
        lockUntil:  Date.now() - (60 * 1000)
    };

    const record = await usergt.create(newUser);
    ```


#### `destroy()` 
* `await destroy(documentId)`
* example
```
    const destroyResultId = await usergt.destroy(userRecordID);
```

#### `expirelockout()` 
* `await expireLockout(username)`
* example
```
    const userRecord = await usergt.expireLockout(username);
```

#### `usergt()` 
* `usergt`
* You can do creative things with the usergt object. 
  All penseur methods can be accessed with `usergt.db`. 
```
    // usergt.db
    // contains pensuer object.
    // usergt.db.table_name.method_name 
    // below retrieves a record from the db.
    const result = await usergt.db.user.get(userRecordID);
```
