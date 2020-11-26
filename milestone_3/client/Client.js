// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const Fuse = require('fuse-native');

const User = require('./User');

// Helper functions
const ops = require("./FileSystem").ops;

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

// User session
let curentUser;

const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

let globalClient;

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

    const client = new hello_proto.Greeter(ADDRESS, credentials);
    globalClient = client;

    // start(client);
    User.update(client);
}

main();

function start(client) {
    console.log(ops);
    ops.setClient(client);
    const fuse = new Fuse('./fuse', ops, { force: false, displayFolder: true });

    fuse.mount(err => {
        if (err) throw err
        console.log('filesystem mounted on ' + fuse.mnt)
    });

    process.once('SIGINT', function () {
        fuse.unmount(err => {
            if (err) {
                console.log('filesystem at ' + fuse.mnt + ' not unmounted', err)
            } else {
                console.log('filesystem at ' + fuse.mnt + ' unmounted')
            }
        })
    })
}

