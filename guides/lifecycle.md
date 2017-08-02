# Lifecycle 

### What is the request lifecycle?
Each incoming request passes through [fifteen pre-defined steps](https://gist.github.com/AdriVanHoudt/562f537ba48301bac76fb3bc42def5b3) , along with six optional extensions.
Only two extension points are guaranteed to be called with every request. ([source docs](https://hapijs.com/api#request-lifecycle)) 

### What is an extension point? 
  An extension point is a point in the request lifecycle where extensions can be added.
  Extension points are hooks that provide an interface for programmers to add custom code 
  to a specific step in the lifecycle. hapi refers to the custom code to be added as ***events***.
  The six possible extension points are: 
  * 'onRequest' extension point
    - **always called**
  * 'onPreAuth' 
  * 'onPostAuth' 
  * 'onPreHandler'
  * 'onPostHandler'
  * 'onPreResponse'
    - **always called**

### What is an extension? 
An extension is an event added to the request lifecycle by the programmer.<br/>
The event is an object which has a method to be executed before proceeded to the next step in the lifecycle.
An extension is registered using [server.ext(events)](https://hapijs.com/api#serverextevents).<br/>
`events` is an object or array of objects with the following: 
  * type - The name of the extension point in the lifecycle where the event is going to be added. 
  * method - a function or an array of functions to be executed at the specified point in the lifecycle. 
  * options (optional object)

Note: not just one event but an array of events can be added at an extension point with [server.ext(events)](https://hapijs.com/api#serverextevents).


### Three levels of extensions:
* **server level**<br/>
  Extends the lifecycle of all requests made to any route in the application.
* **plugin level**<br/>
  Extends the lifecycle of all requests made to routes within a plugin.
* **route level**<br/>
  Extends the lifecycle of requests made to a specific route.

### The beauty of hapi
Hapi gives the developer the ability to extend the lifecycle of: all
request made to the application, all requests made to a specific plugin, or all requests made
to a specific end point. Additionally, hapi also allows the developer to add [pre-requisites](https://hapijs.com/api#route-prerequisites) to routes!.

### References:
* Documentation 
  - [lifecycle](https://hapijs.com/api#request-lifecycle)
  - [server.ext(events)](https://hapijs.com/api#serverextevents) - Register an array of event objects on ***server level*** extension point. 
  - [server.ext(event, method, [options])](https://hapijs.com/api#serverextevent-method-options) - Register a single extension event as a ***server level*** extension point.
  - [route prerequisites](https://hapijs.com/api#route-prerequisites)
* Others:
  - What is a hook?
    A hook is functionality provided by software for users of that software to have their own code called under certain circumstances. 
    That code can augment or replace the current code. 
    (source: [SO](https://stackoverflow.com/questions/467557/what-is-meant-by-the-term-hook-in-programming))
  - @devinivy on [tutorial covering realms and extensions](https://github.com/hapijs/discuss/issues/241) 

### Further research:

#### types of extensions (server versus request)
Function signatures for added extensions differ according to type of extensions. For example, if the extension is ***server extension***,
the signature is: `function(server, next)`. But, if the extension is ***request extension*** the signature is: `function(request, reply)`.   
This tutorial has focused exclusively on request extensions.
For more details about server extensions see: 
* [server extension points](https://hapijs.com/api#serverextevents)<br/>
  In addition to the above mentioned request extension points, the below<br/>
  lists server extension points:<br/>
  - 'onPreStart' - called before the connection listeners are started.
  - 'onPostStart' - called after the connection listeners are started.
  - 'onPreStop' - called before the connection listeners are stopped.
  - 'onPostStop' - called after the connection listeners are stopped.
* ***server extension*** function signatures
  - `function(server, next)`
* [server events](https://hapijs.com/api#server-events)

   
