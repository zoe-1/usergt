# Query API

Exposes query functions through the Query object. <br/>
`Usergt.Query.user.method_name`<br/>

User query functions stored at: **usergt/lib/user/query**.<br/>
Each function has it's own file.<br/>

#### Files 
create.query.js<br/>
destroy.query.js<br/>
expireLockout.query.js<br/>
findByUsername.query.js<br/>
incrementLoginAttempt.query.js<br/>
resetLoginAttempt.query.js<br/>
setLockout.query.js<br/>

#### Query API
User.Query.user.create<br/>
User.Query.user.destroy<br/>
User.Query.user.findByUsername<br/>
User.Query.user.expireLockout<br/>
User.Query.user.setLockout<br/>
User.Query.user.resetLoginAttempt<br/>
User.Query.user.incrementLoginAttempt<br/>

#### Example
```
    const User = require('./path/to/usergt/lib');

    // User.Query.user.[function_name]` provides access to the function. 

    // Example mock below:

    const original = User.Query.user.resetLoginAttempt;

    User.Query.user.resetLoginAttempt = function (userId, callback) {

        User.Query.user.resetLoginAttempt = original;
        return callback(new Error('mock resetLoginAttempt failure'), null); 
    }; 
```
