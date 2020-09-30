const PROTO_PATH = __dirname + '/helloworld.proto';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;


// RPC Method
function sayHello(call, callback) {
  console.log('Message 1: ' + call.request.message_1);
  console.log('Message 2: ' + call.request.message_2);
  callback(null, {message_3: 'Message receive'});
}

// Server
function main() {
  const PORT = ':10000';
  const DOMAIN = 'localhost'
  const ADDRESS = DOMAIN + PORT;
  const server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, {sayHello: sayHello});
  server.bind(ADDRESS, grpc.ServerCredentials.createInsecure());
  server.start();
}

main()
