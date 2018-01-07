# usergt

[API](./API.md)

User management logic: create, destroy, read, authenticate, brute force attack protection, lockout.
Depends on: [Rethinkdb](https://rethinkdb.com/), [Penseur](https://github.com/hueniverse/penseur)

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
hapijs style.


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

100% coverage using [lab](https://github.com/hapijs/lab) & code](https://github.com/hapijs/code)

### License
BSD-3-Clause
