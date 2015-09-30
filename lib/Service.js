var pigato = require('pigato'), service = null, broker = null;


function Service(serviceName, serviceGateway, configs){
  
  // starts the service
  service = new pigato.Worker('tcp://localhost:' + configs.port, serviceName);
  service.start();
  service.on('error', function(e) {
    console.log(e);
    console.log('MicroService "' + serviceName + '" Error: ', e);
    console.trace();
  });
  service.on('request', function(params, pigatoReply){
    // abstraction of specific strategy or library response
    var iClothReply = {
      end: function(data){
        pigatoReply.end(data);
      }
    };
    serviceGateway(params, iClothReply);
  });

  // auto-starts a broker for this service
  var broker = new pigato.Broker("tcp://*:" + configs.port);
  broker.start(function(){});

  console.log('MicroService "' + serviceName +'" started on port ' + configs.port);
};

module.exports = Service;