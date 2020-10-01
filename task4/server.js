// Paths
const PROTO_PATH = __dirname + '/helloworld.proto';
const secureCertificate = __dirname + '/cert/comp4000.com.crt';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;


// RPC Method
function signUp(call, callback) {
    console.log('Received username: ' + call.request.username);
    console.log('Received password: ' + call.request.password);

    const signUpReply = {status: 1, message: 'Success'};
    callback(null, signUpReply);
}

// Server
function main() {
    const PORT = ':10000';
    const DOMAIN = 'localhost'
    const ADDRESS = DOMAIN + PORT;
    const server = new grpc.Server();

    // const options = {cert: fs.readFileSync(secureCertificate)};
    // TODO: Change this to use TLS / SSL
    // const sslCertificate = grpc.credentials.createSsl(grpc.credentials.createInsecure());

    server.addService(hello_proto.Greeter.service, {signUp: signUp});
    server.bind(ADDRESS, grpc.ServerCredentials.createInsecure());
    server.start();
}

main()
