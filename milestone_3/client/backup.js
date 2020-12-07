const readline = require('readline');
const validatePassword = (password, confirmPassword) => password === confirmPassword;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getUserName(msg) {
    const enterUserNamePrompt = 'Please enter your username.';
    let tempMsg = msg ? msg : enterUserNamePrompt;
    return new Promise((accept, reject) =>
        rl.question(msg, answer => accept(answer)));
}

function getUserIsAdminSignUp() {
    const isAdminPrompt = 'Please type 1 to make an admin account or anything else to not have admin: ';
    return new Promise((accept, reject) =>
        rl.question(isAdminPrompt, answer => accept(answer)));
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
function getUserCredentialsLogin(msg) {
    const user = {userName: null, password: null};

    user.userName = getUserName(msg);
    user.password = readInput('Password');

    console.log('Username is: ' + user.userName);
    console.log('Password is: ' + user.password);

    return user;
}

function getUserCredentialsSignUp() {
    const user = {
        userName: null,
        password: null,
        isAdmin: null
    };

    user.userName = getUserName();
    user.password = getUserPasswordSignUp();
    user.isAdmin = null;
    // (isAdmin === '1');
    return Promise.new((accept, reject) =>);
    getUserIsAdminSignUp();
    console.log('Username is: ' + user.userName);
    console.log('Password is: ' + user.password);

    return user;
}

function getMountPoint() {
    const enterMountPointPrompt = 'Please enter your mount point.';
    return readInput(enterMountPointPrompt);
}

module.exports = {
    getUserName: getUserName,
    getUserPasswordSignUp: getUserPasswordSignUp,
    getUserCredentialsLogin: getUserCredentialsLogin,
    getUserCredentialsSignUp: getUserCredentialsSignUp,
    getMountPoint: getMountPoint
};

