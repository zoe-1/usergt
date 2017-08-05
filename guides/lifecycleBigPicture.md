### Big Picture 

The hapi request lifecycle defines how requests are handled by the framework.

![LifeCycleDiagram](../assets/images/lifecycleDiagram.png)




PREP WORK BELOW

Much of the request lifecycle is internal to hapi:
* prepare request
* authentication
* validation 
* process the handler
* validate the response
* send response
However, these internal steps do not operate in a vacuum on their own. They respond to how you have configured the server, connections, routes.
Plus, hapi allows the developer to add their own events to the request lifecycle. Steps added by the developer are called extensions.
See [assignment9](../assignments/a0.0.9.md) for more about adding extensions to the request lifecycle.

For example, if you configured the route options to validate the request's payload with a [Joi](https://www.npmjs.com/package/joi) object, hapi will 
run your configured Joi validation in the validation steps of the lifecycle.

A hapi developer interacts with the request lifecycle but may not know it. For example: 
* payload validation<br/>
  Perhaps a route is configured to validate the request's payload with a [Joi](https://www.npmjs.com/package/joi) object,<br/>
  hapi will run your configured Joi validation in the "validation" steps of the lifecycle.<br/>
* create a route<br/> 
  The "prepare request" step of the lifecycle looks up the route when a request is received. <br/>
  If it is not found, it skips to the end of the lifecycle (onPreResponse) and sends an error response. 
* configure query parameters to a route<br/> 
  A path may be configured as: `path: '/hello/{user}'`.<br/>
  In the "prepare request" stage of the lifecycle, hapi will parse the path and parameters sent to the route.<br/> 

However, the above internal steps in the lifecycle are configured by the developer.
For example, if you configure an authentication plugin like [hapi-auth-hawk](https://www.npmjs.com/package/hapi-auth-hawk) or [hapi-auth-cookie](https://www.npmjs.com/package/hapi-auth-cookie) 
to authenticate users of your application the hapi framework will apply the authentication logic of your configured plugin (e.g. hapi-auth-cookie) at the authentication step of the lifecyle.  
