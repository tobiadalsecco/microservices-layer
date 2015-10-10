var pigato = require('pigato');
var ipRegex = require('ip-regex');
var dockerLinks = require('docker-links');

function Client(port, host, opts){

  this.clients = {};

  host = host || 'localhost';

  if(!opts.onError){
    this.onError = function(e){
      console.log('CLIENT ERROR: ', e);
    };
  } else {
    this.onError = opts.onError;
  }

  if(host == 'localhost'){

    this.type = 'local';
    if(!port) throw new Error('MicroServices Layer Error: You must specify a port!');
    this.connectToService('__servicekey__local', 'tcp://localhost:' + port);

  } else if(ipRegex({exact: true}).test(host)){

    this.type = 'IP';
    if(!port) throw new Error('MicroServices Layer Error: You must specify a port!');
    this.connectToService('__servicekey__IP', 'tcp://' + host + ':' + port);

  } else if(opts.docker){

    this.links = dockerLinks.parseLinks(process.env);
    
  }

};

Client.prototype.connectToService = function(serviceKey, address){

  console.log('Adding Pigato Client: ', serviceKey, ', ', address);

  this.clients[serviceKey] = new pigato.Client(address);
  this.clients[serviceKey].start();
  this.clients[serviceKey].on('error', this.onError);
}

Client.prototype.request = function(serviceKey, params, onResponse){

  var hostKey;

  if(!this.clients[serviceKey]) {
    if(this.type == 'local'){
      hostKey = '__servicekey__local';
    } else if(this.type == 'IP'){
      hostKey = '__servicekey__IP';
    } else {
      this.connectToService(serviceKey, this.links[serviceKey].url);
      hostKey = serviceKey;
    }
  } else {
    hostKey = serviceKey;
  }

  this.clients[hostKey].request(
    serviceKey, 
    params, 
    undefined, 
    function(err, data){
      onResponse(err, data);
    }, 
    { retry: 1 }
  );

};

module.exports = Client;