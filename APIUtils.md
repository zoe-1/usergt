# utils API

usergt exposes query functions through the utils object. <br/>
This allows for functions to be directly acessed or mocked.<br/>
To see all utils functions: `./lib/user/utils`. Each function is stored in it's own file.<br/>

#### Files
* **lib/user/utils**

```
bcrypt.utils.js
checkLockout.utils.js
validate.utils.js
```

#### Utils API
User.utils.bcrypt.compare<br/>
User.utils.bcrypt.hash<br/>
User.utils.user.checkLockout<br/>

#### Example
```
const User = require('./path/to/usergt/lib');
// `User.utils.bcrypt.[function_name]` provides access to the function. 
// `User.utils.bcrypt` provides access to functions inside `bcrypt.utils.js`. 
`User.utils.bcrypt.hash` hashes password string. 

```
