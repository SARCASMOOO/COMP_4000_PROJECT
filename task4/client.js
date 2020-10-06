// Paths
const PROTO_PATH = __dirname + '/helloworld.proto';
const secureCertificate = __dirname + '/cert/comp4000.com.crt';


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

function getUserCredentialsLogin() {
    const user = {
        userName: null,
        password: null
    };

    // console.log('Login');
    // user.userName = getUserName();
    // user.password = readInput('Password');

    user.userName = 'test_user_bcrypt11';
    user.password = 'test_password';

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

    user.userName = 'test_user_bcrypt11';
    user.password = 'test_password1';

    // NOTE: For testing purposes the username and password will be automatically assigned.
    console.log('Username is: ' + user.userName);
    console.log('Password is: ' + user.password);

    return user;
}

const createSecureContext = () => {
    const options = {
        cert: fs.readFileSync(secureCertificate)
    };

    return grpc.credentials.createSsl(options.cert);
}

function signUp(client) {
    const user = getUserCredentialsSignUp();
    client.SignUp({username: user.userName, password: user.password},
        function (err, response) {
            console.log('Message: :', response.message);
            console.log('Response: :', response.status);
        });
}

function login(client, callback) {
    const user = getUserCredentialsLogin();
    client.LogIn({username: user.userName, password: user.password},
        function (e, response) {
            console.log('Token: :', response.message);
            console.log('Response: :', response.status);
            const token = response.message;
            user.token = token;
            callback(e, user);
        });
}

function updatePassword(client, user) {
    client.updatePassword({username: user.userName, token: user.token},
        function (err, response) {
            console.log('Token: :', response.message);
            console.log('Response: :', response.status);
        });
}

function deleteAccount(client, user) {
    client.deleteAccount({username: user.userName, password: user.token},
        function (err, response) {
            console.log('Token: :', response.message);
            console.log('Response: :', response.status);
        });
}

function main() {
    const PORT = ':10000';
    const DOMAIN = 'localhost'
    const ADDRESS = DOMAIN + PORT;

    // TODO: Get secure message working
    // const sslCreds = createSecureContext();

    const client = new hello_proto.Greeter(ADDRESS, grpc.credentials.createInsecure());

    // signUp(client);
    // TODO: Strucutre this better so you can login and the user will be stored on the
    // client side.
    // login(client, updatePassword);
    updatePassword(client);
    deleteAccount(client);
}

main();

