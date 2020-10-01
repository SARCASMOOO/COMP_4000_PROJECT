// Paths
const PROTO_PATH = __dirname + '/helloworld.proto';
// const secure_key = __dirname + '/cert/comp4000.com.key';
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

function getUserPassword() {
    const enterPasswordPrompt = 'Please enter your password: ';
    const enterConfirmPasswordPrompt = 'Confirm Password';
    const attemptsExceeded = 'You exceeded three attempts. Exiting.';
    const passwordsDidNotMatch = 'Passwords didn\'t match.';

    let attempts = 0;

    while(attempts < 3) {
        const password = readInput(enterPasswordPrompt);
        const confirmPassword = readInput(enterConfirmPasswordPrompt);

        if(validatePassword(password, confirmPassword)) return password;
        console.log(passwordsDidNotMatch);
        attempts++;
    }

    console.log(attemptsExceeded);

    process.exit(1);
}

function getUserCredentials() {
    const user = {
        userName: null,
        password: null
    };

    // user.userName = getUserName();
    // user.password = getUserPassword();

    user.userName = 'test_user';
    user.password = 'test_password';

    // NOTE: For testing purposes the username and password will be automatically assigned.
    console.log('Username is: ' + user.userName);
    console.log('Password is: ' + user.password);
}

const createSecureContext = () => {
    const options = {
        cert: fs.readFileSync(secureCertificate)
    };

    return grpc.credentials.createSsl(options.cert);
}

function main() {
    const PORT = ':10000';
    const DOMAIN = 'localhost'
    const ADDRESS = DOMAIN + PORT;

    const sslCreds = createSecureContext();
    const client = new hello_proto.Greeter(ADDRESS, sslCreds);

    getUserCredentials();

    //  client.sayHello({message_1: msg1, message_2: msg2}, function(err, response) {
    //  console.log('Greeting:', response.message_3); d
}

main();
