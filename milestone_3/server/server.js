// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';
const secureCertificate = __dirname + '/../cert/comp4000.com.crt';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const {MongoClient} = require('mongodb');


// Helper classes
const user = require('./user');
const fileSystem = require('./fileSystem');

// Globals
const URI = "mongodb://admin:admin@localhost:27017/comp4000";
const DB_NAME = 'comp4000';
const COLLECTION_NAME = 'clients';

let clientsCollection;
let mongoClient;

function connectToDB(callback) {
    MongoClient.connect(URI, (e, client) => {
        const db = client.db(DB_NAME);
        mongoClient = client;
        clientsCollection = db.collection(COLLECTION_NAME);
        callback();
    });
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
    user.saveDB(clientsCollection);

    const ADDRESS = DOMAIN + PORT;
    const server = new grpc.Server();

    console.log('Server started');

    const rpcMessages = {
        signUp: user.signUp,
        logIn: user.logIn,
        isAuthenticated: user.isAuthenticated,
        updatePassword: user.updatePassword,
        deleteAccount: user.deleteAccount,
        readdir: fileSystem.readdir,
        access: fileSystem.access,
        getattr: fileSystem.getattr,
        open: fileSystem.open,
        read: fileSystem.read,
        opendir: fileSystem.opendir,
        statfs: fileSystem.statfs,
        create: fileSystem.create,
        write: fileSystem.write,
        unlink: fileSystem.unlink,
        mkdir: fileSystem.mkdir,
        rmdir: fileSystem.rmdir,
        chmod: fileSystem.chmod,
    };

    server.addService(hello_proto.Greeter.service, rpcMessages);
    server.bind(ADDRESS, grpc.ServerCredentials.createInsecure());
    server.start();

    return server;
}

function main() {
    const PORT = ':10001';
    const DOMAIN = 'localhost';
    const grpc_proto = loadProto();
    const startServerWrapper = () => startServer(DOMAIN, PORT, grpc_proto);
    connectToDB(startServerWrapper);
}

main();

