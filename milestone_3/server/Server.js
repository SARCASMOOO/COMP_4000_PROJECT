// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';
const secureCertificate = __dirname + '/../cert/comp4000.com.crt';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const {MongoClient} = require('mongodb');

// Helper classes
const user = require('./User');
const fileSystem = require('./FileSystem');
const ACL = require('./ACL/ACL').ACL;

// Globals
const URI = "mongodb://admin:admin@localhost:27017/comp4000";
const DB_NAME = 'comp4000';
const COLLECTION_NAME = 'clients';

let clientsCollection;
let mongoClient;
let acl;

function connectToDB(callback) {
    MongoClient.connect(URI, (e, client) => {
        const db = client.db(DB_NAME);
        mongoClient = client;
        clientsCollection = db.collection(COLLECTION_NAME);
        acl = new ACL(db.collection('ACL'));
        fileSystem.setACL(acl);
        module.exports = {acl: acl};
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

function setMountPoint(call, callback) {
    console.log('Request is: ', call.request);
    const {mountPoint, username, userType} = call.request;
    const r = acl.isAccess(mountPoint, userType, username);
    console.log('ACL returns: ', r);
    const reply = {message: 'Mountpoint set.', status: r};
    callback(null, reply);
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
        unlink: fileSystem.unlink,
        mkdir: fileSystem.mkdir,
        rmdir: fileSystem.rmdir,
        chmod: fileSystem.chmod,
        setMountPoint: setMountPoint
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


