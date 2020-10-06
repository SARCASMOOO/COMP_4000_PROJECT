// Paths
const PROTO_PATH = __dirname + '/helloworld.proto';
const secureCertificate = __dirname + '/cert/comp4000.com.crt';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const {MongoClient} = require('mongodb');
const bcrypt = require('bcrypt');
const crpyto = require('crypto');

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

function generareRandomToken(callback) {
    const bitSize = 64;

    crpyto.randomBytes(bitSize, function (e, buffer) {
        const token = buffer.toString('hex');
        callback(e, token);
    });
}

function generateExpirationDate() {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3);
    return currentDate;
}

// RPC Method
function signUp(call, callback) {
    const user = {username: call.request.username, password: call.request.password};

    const saveUser = () => {
        const BCRYPT_SALT_ROUNDS = 12;
        bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS).then(hashedPwd => {
            user.password = hashedPwd;
            clientsCollection.insert(user).then(() => {
                signUpReply = {status: 1, message: 'Success'};
                callback(null, signUpReply);
            });
        });
    };

    const rejectSaveUser = () => {
        const signUpReply = {status: 0, message: 'Failed user already exists'};
        callback(null, signUpReply);
    }

    clientsCollection.find({username: call.request.username}).limit(1).count().then(count => {
        if (count < 1) {
            saveUser();
        } else {
            rejectSaveUser();
        }
    });
}

function logIn(call, callback) {
    const BCRYPT_SALT_ROUNDS = 12;
    const tempUser = {username: call.request.username, password: call.request.password};

    clientsCollection.findOne({username: tempUser.username}).then(user => {
        function handleUserToken(e, token) {
            const expirationDate = generateExpirationDate();

            clientsCollection.updateOne(
                {username: user.username}, {$set: {token: token, expirationDate: expirationDate}}
            );

            logInReply = {status: 1, message: token};
            callback(null, logInReply);
        }

        if (user) {
            bcrypt.compare(tempUser.password, user.password, function (err, isMatch) {
                console.log(isMatch);
                if (err) {
                    logInReply = {status: -1, message: 'Failed something went wrong.'};
                    callback(null, logInReply);
                } else if (isMatch) {
                    generareRandomToken(handleUserToken);
                } else {
                    logInReply = {status: 0, message: 'Password is not a match!'};
                    callback(null, logInReply);
                }
            })
        } else {
            logInReply = {status: 0, message: 'User was not found.'};
            callback(null, logInReply);
        }


    });
}

function isAuthenticated() {
// TODO: Check if user has permission for an action
}

function updatePassword() {
//  TODO: Update password
}

function deleteAccount() {
// Delete account
}

function startServer(DOMAIN, PORT) {
    const ADDRESS = DOMAIN + PORT;
    const server = new grpc.Server();

    const rpcMessages = {
        signUp: signUp,
        logIn: logIn,
        updatePassword: updatePassword,
        deleteAccount: deleteAccount
    };

    server.addService(hello_proto.Greeter.service, rpcMessages);
    server.bind(ADDRESS, grpc.ServerCredentials.createInsecure());
    server.start();

    return server;
}

function main() {
    const PORT = ':10000';
    const DOMAIN = 'localhost';
    const server = startServer(DOMAIN, PORT);
}


