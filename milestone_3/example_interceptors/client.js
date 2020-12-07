// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

// Config
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

function main() {
    const PORT = ':10001';
    const DOMAIN = 'localhost'
    const ADDRESS = DOMAIN + PORT;

    // The credentials part I borrowed from the following repository
    // https://github.com/gbahamondezc/node-grpc-ssl/blob/master/
    const credentials = grpc.credentials.createSsl(
        fs.readFileSync('../certs/ca.crt'),
        fs.readFileSync('../certs/client.key'),
        fs.readFileSync('../certs/client.crt')
    );

    const stub = new hello_proto.Greeter(ADDRESS, credentials);
    start(stub);
}

main();

function start(stub) {
    stub.test({},
        function (err, response) {
            console.log(response);
        }
    );
}
