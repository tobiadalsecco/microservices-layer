var pigato = require('pigato'), client = null;

var ipRegex = require('ip-regex');

var dockerLinks = require('docker-links');

function Client(port, host, opts){

  var address;


  if(!port) {
    throw new Error('MicroServices Layer Error: You must specify a port!');
  }

  host = host || 'localhost';

  if(host == 'localhost'){
    address = 'tcp://' + host + ':' + port;
  } else if(ipRegex({exact: true}).test(host)){
    address = 'tcp://' + host + ':' + port;
  } else if(opts.docker){
    var links = dockerLinks.parseLinks(process.env);
    address = links[host].url;
  }

  client = new pigato.Client(address);
  client.start();

  client.on('error', function(e) {
    console.log('CLIENT ERROR: ', e);
  });

};

Client.prototype.request = function(service, params, onResponse, options){
  //console.log('iCloth MS Request: ' + service);
  client.request(
    service, 
    params, 
    undefined, 
    function(err, data){
      onResponse(err, data);
    }, 
    {retry: 1}
  );
};

module.exports = Client;