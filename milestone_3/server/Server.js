// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';
const secureCertificate = __dirname + '/../cert/comp4000.com.crt';
const root_file_path = '/Users/main/Coding/school/COMP_4000/milestone_3/server/real';

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
    const expirationDate = call.request.expirationDate;
    if (isTokenExpired(expirationDate)) {
        const msg = "Token is expired please login first.";
        callback(null, {status: false, message: msg});
    }

    console.log('Request is: ', call.request);
    const {mountPoint, username, userType} = call.request;
    const r = acl.isAccess({
        path: mountPoint,
        permissions: 'r'
    }, userType, username);
    console.log('ACL returns: ', r);
    const reply = {message: 'Mountpoint status: ', status: r};
    if(r) {
        // Create the mount point
        try {
            fs.mkdir(root_file_path + mountPoint, { recursive: true }, (err) => {
                if (err) console.log(err);
                callback(null, reply);
            });
        } catch (e) {
            callback(null, reply);
        }
    } else {
        callback(null, reply);
    }
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
        setMountPoint: setMountPoint,
        createRuleForUser: createRuleForUser,
        readRulesByUser: readRulesByUser,
        updateRule: updateRule,
        removeRule: removeRule
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

function isTokenExpired(startTime) {
    const timeToLive = 2000;
    const endTime = new Date().getTime();
    return (endTime - startTime > timeToLive);
}

main();

// ACL functions
function createRuleForUser(call, callback) {
    // if(isTokenExpired(call.request.expirationDate)) {
    //     callback(null, {message: 'Token is expired please log in.'});
    // }

    const rule = call.request.newRule;
    acl.createRuleForUser(rule).then(() => {
        callback(null, {message: 'New rule was created.'});
    });
}

function readRulesByUser(call, callback) {
    const username = call.request.username;

    if(isTokenExpired(call.request.expirationDate)) {
        callback(null, {message: 'Token is expired please log in.'});
        return;
    }

    acl.readRulesByUser(username).then(rules => {
        callback(null, {rules: rules});
    });
}

function updateRule(call, callback) {
    const ruleId = call.request.ruleId;
    const update = call.request.update;

    console.log(update);

    acl.updateRule(ruleId, update).then((a) => {
        console.log(a);
        callback(null, {message: 'Rule updated'});
    });
}

function removeRule(call, callback) {
    const ruleId = call.request.ruleId;

    acl.removeRule(ruleId).then(() => {
        callback(null, {message: 'Rule removed'});
    });
}

