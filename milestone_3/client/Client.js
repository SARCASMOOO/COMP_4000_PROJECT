const User = require('./User');
// const UI = require('./UI');
const Util = require('../common/Util');
// const Setup = require('./Setup');

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

let stub;

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
    let client = new hello_proto.Greeter(ADDRESS, getGRPCcredentials());
    return client;
}

function update() {
    const msg = 'Please type one of the following commands: 0 to exit, 1 for sign up, 2 for log in, 3 to update password, 4 to remove account.';
    let command;

    while (true) {
        command = Util.readInput(msg);
        switch (command) {
            case "0":
                process.exit(1);
            case "1":
                User.signUp(stub);
                break;
            // case "2":
            //     User.login();
            //     break;
            // case "3":
            //     User.updatePassword();
            //     break;
            // case "4":
            //     User.deleteAccount();
            //     break;
            default:
                console.log('Invalid option. Please select one of the options provided.');
        }
    }

}

function main() {
    stub = saveClientStubInFileSystem();
    // mountFuse();
    // UI.welcome();
    update();
}

main();


