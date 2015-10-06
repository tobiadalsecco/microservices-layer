var pigato = require('pigato'), client = null;

function Client(port, configs){

  if(!port) {
    throw new Error('MicroServices Layer: You must specify a port!');
  }

  client = new pigato.Client('tcp://localhost:' + port);
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