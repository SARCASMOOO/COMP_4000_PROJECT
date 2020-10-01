// Paths
const PROTO_PATH = __dirname + '/helloworld.proto';
const secureCertificate = __dirname + '/cert/comp4000.com.crt';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const {MongoClient} = require('mongodb');
const bcrypt = require('bcrypt');

// Globals
const uri = "mongodb://admin:admin@localhost:27017/comp4000";
let clientsCollection;
let mongoClient;

MongoClient.connect(uri, (err, client) => {
    const db = client.db('comp4000');
    mongoClient = client;
    clientsCollection = db.collection('clients');
    main();
});

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
    const BCRYPT_SALT_ROUNDS = 12;
    const tempUser = {username: call.request.username, password: call.request.password};

    clientsCollection.find({username: call.request.username}).limit(1).count().then(count => {
        let signUpReply;
        if (count < 1) {
            bcrypt.hash(tempUser.password, BCRYPT_SALT_ROUNDS).then(hashedPwd => {
                tempUser.password = hashedPwd;

                console.log('HAshed password sign up is: ', tempUser.password);

                clientsCollection.insert(tempUser).then(() => {
                    signUpReply = {status: 1, message: 'Success'};
                    callback(null, signUpReply);
                });
            });
        } else {
            signUpReply = {status: 0, message: 'Failed user already exists'};
            callback(null, signUpReply);
        }
    });
}

function logIn(call, callback) {
    console.log('Received username: ' + call.request.username);
    console.log('Received password: ' + call.request.password);
    const BCRYPT_SALT_ROUNDS = 12;
    const tempUser = {username: call.request.username, password: call.request.password};

    clientsCollection.findOne({username: tempUser.username}).then(user => {
        if(user) {
            bcrypt.compare(tempUser.password, user.password, function(err, isMatch) {
                console.log(isMatch);
                if (err) {
                    throw err
                } else if (isMatch) {
                    console.log("Password is a match!")
                } else {
                    console.log("Password is not a match!")
                }
            })
        } else {
            console.log('User not found')
        }
    });
}

// Server
function main() {
    const PORT = ':10000';
    const DOMAIN = 'localhost'
    const ADDRESS = DOMAIN + PORT;
    const server = new grpc.Server();
    const rpcMessages = {signUp: signUp, logIn: logIn};

    // const options = {cert: fs.readFileSync(secureCertificate)};
    // TODO: Change this to use TLS / SSL
    // const sslCertificate = grpc.credentials.createSsl(grpc.credentials.createInsecure());

    server.addService(hello_proto.Greeter.service, rpcMessages);
    server.bind(ADDRESS, grpc.ServerCredentials.createInsecure());
    server.start();
}


