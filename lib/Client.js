var pigato = require('pigato'), client = null;

function Client(ports, configs){

  var brokers = [];
  if(!ports){
    ports = ['3001'];
  } else if(typeof ports == 'string'){
    ports = [ports]
  }
  for(i in ports){
    brokers.push('tcp://localhost:' + ports[i]);
  }

  client = new pigato.Client(brokers);
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