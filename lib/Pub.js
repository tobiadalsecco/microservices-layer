var zmq = require('zmq');

function Pub(port){
  this.sock = zmq.socket('pub');
  this.sock.bindSync('tcp://*:' + port);
}

Pub.prototype.publish = function(topic, payload){
  this.sock.send([topic, JSON.stringify(payload)]);
}
 
module.exports = Pub;