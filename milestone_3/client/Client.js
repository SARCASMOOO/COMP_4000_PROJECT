// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const Fuse = require('fuse-native');
const User = require('./User');
const ops = require("./FileSystem").ops;

// Constants
const PORT = ':10001';
const DOMAIN = 'localhost'
const ADDRESS = DOMAIN + PORT;

// User session
let curentUser;

// The credentials part I borrowed from the following repository
// https://github.com/gbahamondezc/node-grpc-ssl/blob/master/
const getCredentials = () => grpc.credentials.createSsl(
    fs.readFileSync('../certs/ca.crt'),
    fs.readFileSync('../certs/client.key'),
    fs.readFileSync('../certs/client.crt')
);

function getProto() {
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

function getStub(credentials, proto) {
    const stub = new proto.Greeter(ADDRESS, credentials);
    return stub;
}

function moundFuse(stub) {
    ops.setClient(stub);
    const fuse = new Fuse('./fuse', ops, {force: false, displayFolder: true});

    fuse.mount(err => {
        if (err) throw err
        console.log('filesystem mounted on ' + fuse.mnt);
        User.saveFuse(fuse);
        User.update(stub);
    });

    process.once('SIGINT', () => unmoundFuse(fuse));
}

function unmoundFuse(fuse) {
    fuse.unmount(err => {
        if (err) {
            console.log('filesystem at ' + fuse.mnt + ' not unmounted', err)
        } else {
            console.log('filesystem at ' + fuse.mnt + ' unmounted')
        }
    })
}

function main() {
    const credentials = getCredentials();
    const proto = getProto();
    const stub = getStub(credentials, proto);
    moundFuse(stub);
}

main();


