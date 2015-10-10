# Microservices Layer

EARLY ALPHA, DON'T USE IT IN PRODUCTION!

A wrapper for microservices strategies, based on [Pigato](https://www.npmjs.com/package/pigato) (ZeroMQ) with an optional network abstraction for Docker Links. 

Also provides Pub/Sub functionalities .

## Install

npm install --save microservices-layer

## How to use

### Client

#### Localhost

```javascript

var port = 1234;
var host = 'localhost';

var MsLayer = require('microservices-layer');
MicroServices = new MsLayer.Client(port, host);

MicroServices.request(
  // the service identifier string. DON'T use hifens or underscores in the name.
  'someservice',
  // the json payload
  {
    some: 'payload',
    any: 'data'
  },
  // callback
  function(err, response){
    // do something
  }
);

```

#### Between Docker Containers

Since 1.0.6 you can abstract your network between Docker containers using Docker Links. Just use the same string for your service name and your service's Docker container/link (In the service).

```javascript

var port = 1234;
var host = 'someservice'; // the service identifier string. DON'T use hifens or underscores in the name.

var MsLayer = require('microservices-layer');
MicroServices = new MsLayer.Client(port, host, {docker:true});

MicroServices.request(
  // the service identifier string. DON'T use hifens or underscores in the name.
  'someservice',
  // the json payload
  {
    some: 'payload',
    any: 'data'
  },
  // callback
  function(err, response){
    // do something
  }
);

```

Client is lazy, it means that the tcp connection with zmq will be only open the first time the service is called and, as the connection is based on the service name, you don't need any additional configuration besides the Docker Links. Just request the service by its name, enywhere in your code.

### Service

The service will not change its configuration, it will be the same for localhost or Docker environments. Just use the right service name.

```javascript

var MsLayer = require('microservices-layer');

var serviceName = 'someservice'; // the service identifier string. DON'T use hifens or underscores in the name.
var serviceConfigs = {
  port: 1234
};
var serviceGateway = function(params, reply){

  // some logic maybe...
  switch(params.cmd){

    // call some internal functions
    case "create" : createSomething(params, function(data){ reply.end(data); }); break;
    case "read"   : readSomething(params, function(data){ reply.end(data); }); break;
    case "update" : updateSomething(params, function(data){ reply.end(data); }); break;
    case "delete" : deleteSomething(params, function(data){ reply.end(data); }); break;

    // invalid command
    default:
      reply.end({
        sta: 0,
        msg: 'invalid:cmd'
      });
  }
};

var service = new MsLayer.Service(serviceName, serviceGateway, serviceConfigs);

```


## Pub/Sub

Since 0.1.2 you can use Pub/Sub directly with this module and with a very simple syntax.

### Publisher

```javascript

var MsLayer = require('microservices-layer');

var Publisher = new MsLayer.Pub(3002);

// then, somewhere in your code...
Publisher.publish('SomeEvent', { some:'value', other: 'value' });

```

### Subscriber

```javascript

var MsLayer = require('microservices-layer');

Subscriber = new MsLayer.Sub(3002);

// subscription is automatic, just set your callback
Subscriber.on('someEvent', function(data){
  // do something
});

```