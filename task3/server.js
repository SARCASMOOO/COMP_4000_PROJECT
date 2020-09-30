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
  console.log('Hello ' + call.request.name);
  callback(null, {message: 'Hello ' + call.request.name});
}

// Server
function main() {
  const PORT = ':10000';
  const DOMAIN = 'localhost'
  const ADDRESS = DOMAIN + PORT;
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, {sayHello: sayHello});
  server.bind(ADDRESS, grpc.ServerCredentials.createInsecure());
  server.start();
}

main()
