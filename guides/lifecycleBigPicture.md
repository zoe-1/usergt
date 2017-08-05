### Request Lifecycle Big Picture 

The request lifecycle determines how requests are handled by the framework.
Each incoming request passes through [six general pre-defined steps](https://gist.github.com/AdriVanHoudt/562f537ba48301bac76fb3bc42def5b3) , along with six optional extensions.

### diagramA
![LifeCycleDiagram](../assets/images/lifecycleDiagram.png)

### pre-defined steps

The request lifecycle is pre-defined by the hapi framework.<br/>
The steps in the above diagram marked with a single asterisk (*) are the pre-defined steps. 
These steps do not operate in a vacuum. They respond to how you configure the server, connections, and routes. 


### extending the lifecycle

The pre-defined steps of the lifecycle can be extended by the developer with extensions.
Find the six request lifecycle extension points in the above diagram.  They are:
* 'onRequest'
* 'onPreAuth' 
* 'onPostAuth' 
* 'onPreHandler'
* 'onPostHandler'
* 'onPreResponse'


### What is an extension point? 
An extension point is a stage in the request lifecycle where extensions can be added.
Extension points are hooks that provide an interface for programmers to add custom code 
to a specific step in the lifecycle. hapi refers to the added custom code as ***events***.
There only two extension points guaranteed to be called with every request. The above diagram marks 
the two extension points guaranteed to be called with double asterisks (**).


### What is an extension? 
An extension is an event added to the request lifecycle by the programmer.<br/>
The event is an object which has a method to be executed before proceeding to the next step of the lifecycle.
An extension is registered using [server.ext(events)](https://hapijs.com/api#serverextevents) or by configuring
[route options](https://hapijs.com/api#route-options) of the [route configuration object](https://hapijs.com/api#route-configuration) .<br/>
`events` is an object or array of objects with the following: 
  * type - The name of the extension point in the lifecycle where the event is going to be added. 
  * method - a function or an array of functions to be executed at the specified point in the lifecycle. 
  * options (optional object)

Note: not just one event but an array of events can be added at an extension point with [server.ext(events)](https://hapijs.com/api#serverextevents).

### Three levels of extensions:
* **connection-level**<br/>
  Extends the lifecycle of all requests made to any route on a specific server connection.<br/>
  Our project has two connections:
  - `const web = server.select('web');`
  - `const webTls = server.select('web-tls');`
  - The manifest declared in `lib/start.js` configures connections for our server.
  - `lib/index.js` applies ***connection-level*** extensions to the `web` and `webTls` connections.

* **plugin-level**<br/>
  Extends the lifecycle of all requests made to routes within a plugin.
* **route-level**<br/>
  Extends the lifecycle of requests made to a specific route.

### Beauty of hapi request lifecycle
Hapi gives the developer the ability to extend the request lifecycle on:  
server connections, plugins, and routes. Plus, the added extensions (events) can be configured to execute at one of the
six different extension points in the request lifecycle.  At the completion of [assignment9](../assignments/a0.0.9.md) our project has ***connection-level*** and ***route level***  extensions.

### Lifecycle Details: 
[hapi lifecycle documentation](https://hapijs.com/api#request-lifecycle) shows there are fifteen pre-defined steps in the lifecycle.
Those steps can be grouped into six general steps. Below Lifecycle Details Diagram shows all fifteen steps 
grouped into the six categories used in the previous diagram.  Or, checkout the [documenation](https://hapijs.com/api#request-lifecycle).
### Lifecycle Details Diagram
![LifeCycleDetails](../assets/images/lifecycleDetailsDiagram.png)

### References:
* I believe Matt Harrison in Mannings hapijs book also groups the fifteen predefined steps into six groups.
  Think @AdriVanHoudt references this work [here](https://gist.github.com/AdriVanHoudt/562f537ba48301bac76fb3bc42def5b3)
* Documentation 
  - [lifecycle](https://hapijs.com/api#request-lifecycle)
  - [server.ext(events)](https://hapijs.com/api#serverextevents) - Register an array of event objects on ***connection-level*** extension point. 
  - [server.ext(event, method, [options])](https://hapijs.com/api#serverextevent-method-options) - Register a single extension event as a ***connection-level*** extension point.

* Others:
  - What is a hook?
    A hook is functionality provided by software for users of that software to have their own code called under certain circumstances. 
    That code can augment or replace the current code. 
    (source: [SO](https://stackoverflow.com/questions/467557/what-is-meant-by-the-term-hook-in-programming))
  - @devinivy [tutorial covering realms and extensions](https://github.com/hapijs/discuss/issues/241) 
  - [route prerequisites](https://hapijs.com/api#route-prerequisites)<br/>
    hapi allows the developer to add [pre-requisites](https://hapijs.com/api#route-prerequisites) to routes! 
    route pre-requisites are route-level extensions executed before the handler.  



PREP WORK BELOW

They are:
* prepare request
* authentication
* validation 
* process the handler
* validate the response
* send response


Our ability to maximize the power of the hapi framework will depend on our understanding and use of the request lifecycle and plugins. 
If we build a route that handles a request we are working with the request lifecycle but may not know it. For example: 
* payload validation<br/>
  Perhaps a route is configured to validate the request's payload with a [Joi](https://www.npmjs.com/package/joi) object,<br/>
  hapi will run your configured Joi validation in the "validation" steps of the lifecycle.<br/>
* create a route<br/> 
  The "prepare request" step of the lifecycle looks up the route when a request is received. <br/>
  If it is not found, it skips to the end of the lifecycle (onPreResponse) and sends an error response. 
* configure query parameters to a route<br/> 
  A path may be configured as: `path: '/hello/{user}'`.<br/>
  In the "prepare request" stage of the lifecycle, hapi will parse the path and parameters sent to the route.<br/> 



The request lifecycle 
and plugin architecture are the backbone of hapi ([source](https://gist.github.com/AdriVanHoudt/562f537ba48301bac76fb3bc42def5b3)).

Plus, hapi allows the developer to add their own events to the request lifecycle. Steps added by the developer are called extensions.
See [assignment9](../assignments/a0.0.9.md) for more about adding extensions to the request lifecycle.
For example, if you configured the route options to validate the request's payload with a [Joi](https://www.npmjs.com/package/joi) object, hapi will 
run your configured Joi validation in the validation steps of the lifecycle.


However, the above internal steps in the lifecycle are configured by the developer.
For example, if you configure an authentication plugin like [hapi-auth-hawk](https://www.npmjs.com/package/hapi-auth-hawk) or [hapi-auth-cookie](https://www.npmjs.com/package/hapi-auth-cookie) 
to authenticate users of your application the hapi framework will apply the authentication logic of your configured plugin (e.g. hapi-auth-cookie) at the authentication step of the lifecyle.  
