// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';
const interceptors = require('@pionerlabs/grpc-interceptors');

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const myMiddlewareFunc = async function (ctx, next, errorCb) {
    try {
        console.log('ctx', ctx);
        // do stuff before call
        console.log('Making gRPC call...');
        await next()
        // do stuff after call
        console.log(ctx.status.code);
    } catch(e) {
        errorCb({
            code: grpc.status.INTERNAL,
            message: 'Some error occurred!'
        });
    }
}


function loadProto() {
    const packageDefinition = protoLoader.loadSync(
        PROTO_PATH,
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

    return grpc.loadPackageDefinition(packageDefinition).helloworld;
}

function startServer(DOMAIN, PORT, hello_proto) {
    const ADDRESS = DOMAIN + PORT;
    const server = interceptors.serverProxy(new grpc.Server());

    console.log('Server started');

    const rpcMessages = {
        test: test,
    };

    // The credentials part I borrowed from the following repository
    // https://github.com/gbahamondezc/node-grpc-ssl/blob/master/
    const credentials = grpc.ServerCredentials.createSsl(
        fs.readFileSync('../certs/ca.crt'), [{
            cert_chain: fs.readFileSync('../certs/server.crt'),
            private_key: fs.readFileSync('../certs/server.key')
        }], true);

    server.addService(hello_proto.Greeter.service, rpcMessages);
    server.bind(ADDRESS, credentials);
    server.start();
    server.use(myMiddlewareFunc);
    return server;
}

function main() {
    const PORT = ':10001';
    const DOMAIN = 'localhost';
    const grpc_proto = loadProto();
    startServer(DOMAIN, PORT, grpc_proto);
}

function test(call, callback) {
    console.log('Test');
    callback(null, {response: 1});
}

main();


