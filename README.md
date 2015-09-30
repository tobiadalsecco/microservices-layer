# Microservices Layer

EARLY ALPHA, DON'T USE IT IN PRODUCTION!

A wrapper for microservices strategies, with Pigato (ZeroMQ).

The only porpouse of this module is to provide further abstraction.

## Install

npm install --save microservices-layer

## How to use

### Client

```javascript

var port = 1234; // @TODO set more ports, and hosts (currently localhost)

var MsLayer = require('microservices-layer');
MicroServices = new MsLayer.Client(port);

MicroServices.request(
  // the service identifier string
  'some-service',
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

### Server

```javascript

var serviceName = 'some-service';
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