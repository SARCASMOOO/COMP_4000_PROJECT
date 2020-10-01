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

function getUserPassword() {
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

    return user;
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

    // TODO: Get secure message working
    // const sslCreds = createSecureContext();

    const client = new hello_proto.Greeter(ADDRESS, grpc.credentials.createInsecure());

    const user = getUserCredentials();

    client.SignUp({username: user.userName, password: user.password},
        function (err, response) {
            console.log('Message: :', response.message);
            console.log('Response: :', response.status);
        });
}

main();
