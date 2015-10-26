var pigato = require('pigato');
var ipRegex = require('ip-regex');
var dockerLinks = require('docker-links');
var dns = require('dns');

function Client(port, host, opts){

  this.clients = {};

  this.opts = opts;

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

  var me = this;

  this.clients[serviceKey] = new pigato.Client(address, {
    onDisconnect: function(){
      console.log(' CLIENT DISCONNECTED FROM ', serviceKey);
      delete me[serviceKey];
    }
  });
  this.clients[serviceKey].start();
  this.clients[serviceKey].on('error', this.onError);
}

Client.prototype.request = function(serviceKey, params, onResponse){

  var hostKey = serviceKey;

  var me = this;

  if(!this.clients[serviceKey]) {
    if(this.type == 'local'){
      hostKey = '__servicekey__local';
      this._req(serviceKey, hostKey, params, onResponse);
    } else if(this.type == 'IP'){
      hostKey = '__servicekey__IP';
      this._req(serviceKey, hostKey, params, onResponse);
    } else {
      // Docker links + Weave
      if(this.opts.weave){
        dns.resolve4(serviceKey + '.weave.local', function (err, addresses) {
          me.connectToService(serviceKey, 'tcp://' + addresses[0] + ':' + me.links[serviceKey].port);
          me._req(serviceKey, hostKey, params, onResponse);
        });
      // only Docker links
      } else {
        this.connectToService(serviceKey, this.links[serviceKey].url);
        this._req(serviceKey, hostKey, params, onResponse);
      }
    }
  } else {
    this._req(serviceKey, hostKey, params, onResponse);
  }

  

};

Client.prototype._req = function(serviceKey, hostKey, params, onResponse){
  this.clients[hostKey].request(
    serviceKey, 
    params, 
    undefined, 
    function(err, data){
      onResponse(err, data);
    }, 
    { retry: 1 }
  );
}

module.exports = Client;