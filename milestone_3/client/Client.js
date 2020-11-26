// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';

// Modules
const readlineSync = require("readline-sync");
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const Fuse = require('fuse-native');

const UI = require('./UI');

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

// Utils
const readInput = msg => readlineSync.question(msg);

function signUp(client) {
    const user = UI.getUserCredentialsSignUp();
    client.SignUp({username: user.userName, password: user.password},
        function (err, response) {
            if (response.status === 0) {
                console.log('Message: ', response.message);
            } else {
                console.log('Response: :', response.status);
                console.log('Message: :', response.message);
                curentUser = user;
            }
            update(client);
        });
}

function login(client) {
    const user = UI.getUserCredentialsLogin();
    client.LogIn({username: user.userName, password: user.password},
        function (e, response) {
            if (response.status === 0) {
                console.log('Failed to login. Message: ', response.message);
            } else {
                console.log('Token: :', response.message);
                console.log('Response: :', response.status);

                const token = response.message;
                user.token = token;
                curentUser = user;
                console.log(curentUser);
            }
            update(client);
        });
}

function updatePassword(client, user) {
    const newPassword = UI.getUserPasswordSignUp();

    if (!curentUser) {
        console.log('Please login before trying to update your password.');
        console.log(curentUser);
        update(client);
    } else {
        client.updatePassword({username: curentUser.userName, token: curentUser.token, newPassword: newPassword},
            function (err, response) {
                if (response.status === 0) {
                    console.log('Failed to update password. Message: ', response.message);
                } else {
                    console.log('Response: :', response.message);
                    curentUser.token = null;
                }
                update(client);
            });
    }
}

function deleteAccount(client) {
    if (!curentUser) {
        console.log('Please login before trying to delete your account.');
        update(client);
    } else {
        client.deleteAccount({username: curentUser.userName, token: curentUser.token},
            function (err, response) {
                if (response.status === 1) {
                    console.log(curentUser.userName, ' was removed.')
                } else {
                    console.log('Failed to remove account: ', response.message)
                }
                update(client);
            });
    }
}

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
    update(client);
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

function update(client) {
    let command;
    let counter = 0;
    const msg = 'Please type one of the following commands: 0 to exit, 1 for login, 2 for signup, 3 to update password, 4 to remove account.';
    command = readInput(msg);
    switch (command) {
        case "0":
            process.exit(1);
            break;
        case "1":
            login(client);
            break;
        case "2":
            signUp(client);
            break;
        case "3":
            updatePassword(client);
            break;
        case "4":
            deleteAccount(client);
            break;
        default:
            console.log('Invalid option. Please select one of the options provided.');
    }
}
