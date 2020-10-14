// Paths
const PROTO_PATH = __dirname + '/helloworld.proto';

// Modules
const readlineSync = require("readline-sync");
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

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

// Get user credentials.
const validatePassword = (password, confirmPassword) => password === confirmPassword;

function getUserName() {
    const enterUserNamePrompt = 'Please enter your username.';
    return readInput(enterUserNamePrompt);
}

function getUserPasswordSignUp() {
    const enterPasswordPrompt = 'Please enter your password: ';
    const enterConfirmPasswordPrompt = 'Confirm Password';
    const attemptsExceeded = 'You exceeded three attempts. Exiting.';
    const passwordsDidNotMatch = 'Passwords didn\'t match.';

    let attempts = 0;

    while (attempts < 3) {
        const password = readInput(enterPasswordPrompt);
        const confirmPassword = readInput(enterConfirmPasswordPrompt);

        if (validatePassword(password, confirmPassword)) return password;
        console.log(passwordsDidNotMatch);
        attempts++;
    }

    console.log(attemptsExceeded);
    process.exit(1);
}

// TODO: This needs to store the users token.
function getUserCredentialsLogin() {
    const user = {userName: null, password: null};

    // console.log('Login');
    // user.userName = getUserName();
    // user.password = readInput('Password');

    user.userName = 'test_user_bcrypt11';
    user.password = 'a';

    // NOTE: For testing purposes the username and password will be automatically assigned.
    console.log('Username is: ' + user.userName);
    console.log('Password is: ' + user.password);

    return user;
}

function getUserCredentialsSignUp() {
    const user = {
        userName: null,
        password: null
    };

    // user.userName = getUserName();
    // user.password = getUserPasswordSignUp();

    user.userName = 'test_user_bcrypt004';
    user.password = 'test_password1';

    // NOTE: For testing purposes the username and password will be automatically assigned.
    console.log('Username is: ' + user.userName);
    console.log('Password is: ' + user.password);

    return user;
}


function signUp(client) {
    const user = getUserCredentialsSignUp();
    client.SignUp({username: user.userName, password: user.password},
        function (err, response) {
            if (response.status === 0) {
                console.log('Message: ', response.message);
            } else {
                console.log('Response: :', response.status);
                console.log('Message: :', response.message);
                curentUser = user;
            }
        });
}


function login(client) {
    const user = getUserCredentialsLogin();
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
        });
}

function updatePassword(client, user) {
    const newPassword = getUserPasswordSignUp();

    if(!curentUser) {
        console.log('Please login before trying to update your password.');
        console.log(curentUser);
        return;
    }

    client.updatePassword({username: curentUser.userName, token: curentUser.token, newPassword: newPassword},
        function (err, response) {
            if (response.status === 0) {
                console.log('Failed to update password. Message: ', response.message);
            } else {
                console.log('Response: :', response.message);
                curentUser.token = null;
            }
        });
}

function deleteAccount(client) {
    if(!curentUser) {
        console.log('Please login before trying to delete your account.');
        return;
    }

    client.deleteAccount({username: curentUser.userName, token: curentUser.token},
        function (err, response) {
            console.log('Token: :', response.message);
            console.log('Response: :', response.status);
        });
}

function main() {
    const PORT = ':10001';
    const DOMAIN = 'localhost'
    const ADDRESS = DOMAIN + PORT;

    const client = new hello_proto.Greeter(ADDRESS, grpc.credentials.createInsecure());

    // signUp(client);
    login(client);
    // setTimeout(() => updatePassword(client), 1000);
    setTimeout(() => deleteAccount(client), 1000);
    // isAuthenticated(client);
}

main();

