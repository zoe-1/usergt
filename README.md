# usergt

manage user data logic
[Rethinkdb](https://rethinkdb.com/), [Penseur](https://github.com/hueniverse/penseur)

[API](./API.md)

### Brute force protection:

* bcrypt password hashing
  > Introduces a work factor, which determines how expensive the hash function will be.
  > Because of this, bcrypt can keep up with Moore’s law. As computers get faster you can increase
  > the work factor and the hash will get slower.
  See: [How to safely store a password](https://codahale.com/how-to-safely-store-a-password)
  for more about storing and authenticating passwords with bcrypt.
* Account Locking<br/>
  After ten failed attempts on an existing account, lock the users account for 24 hours.

### User record validation

Implements Joi to validate userRecords are valid structure (create, authenticate).
authenticate filters out invalid username and passwords to avoid the database read.

###  Basic RBAC (Role Based Accessed Controls)

User objects have a `scope` key.
The scope key is an array of labels. For example, `['admin', 'user']`.

* hapijs scopes
`hapi` uses scopes to determine authorization for actions on routes.
Scope values need to be set in the user record object and hapi route.
Scopes can be viewed as role labels of RBAC.
  - userRecord object `scope` array.
    A valid userRecord object has a `scope` key which is an array of scope labels.
  - hapi route scope array
    hapi routes that require authorization are configured with a scopes array of labels/roles.
    If a user's scopes do not match scope on a route the user is denied access.

* Adusting scope validations
  Tests assume two scopes exist: `admin` `user`.
  To add other scopes modify the validation schema, change
  `scope: Joi.array().items(Joi.string().valid('admin', 'user').required())`
  in **./lib/user/validate.js**.

* Read more about hapi scopes
  - [route-options](https://hapijs.com/api#route-options).
  - [route config](https://hapijs.com/tutorials/routing?#config)
  - @nlf Nathan LaFreniere [Harnessing the magic of Hapi scopes](https://blog.andyet.com/2015/06/16/harnessing-hapi-scopes/)
  - @poeticninja Saul Maddox [Authentication and Authorization with hapi](https://medium.com/@poeticninja/authentication-and-authorization-with-hapi-5529b5ecc8ec)
  - [Mongoose & bcrypt](http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt)

### Style Guide

Follows [hapijs coding conventions](https://github.com/hapijs/contrib/blob/master/Style.md).

### Error Handling

Uses boom to build and return error objects.

### Tests

100% coverage using [jest](https://facebook.github.io/jest/)

### License
BSD-3-Clause
