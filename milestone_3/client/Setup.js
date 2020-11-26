// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

// Config
const loadProtoOptions = {keepCase: true, longs: String, enums: String, defaults: true, oneofs: true};
const packageDefinition = protoLoader.loadSync(PROTO_PATH, loadProtoOptions);
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

// Variables
const PORT = ':10002';
const DOMAIN = 'localhost'
const ADDRESS = DOMAIN + PORT;

let client;

function getGRPCcredentials() {
    return (
        grpc.credentials.createSsl(
            fs.readFileSync('../certs/ca.crt'),
            fs.readFileSync('../certs/client.key'),
            fs.readFileSync('../certs/client.crt'))
    );
}

function saveClientStubInFileSystem() {
    // The credentials part I borrowed from the following repository
    // https://github.com/gbahamondezc/node-grpc-ssl/blob/master/
    client = new hello_proto.Greeter(ADDRESS, getGRPCcredentials());
    return client;
}

