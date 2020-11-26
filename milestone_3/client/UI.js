const Util = require('../common/Util');

const PORT = ':10002';
const DOMAIN = 'localhost'
const ADDRESS = DOMAIN + PORT;

function getUserName() {
    const enterUserNamePrompt = 'Please enter your username.';
    return Util.readInput(enterUserNamePrompt);
}

function getUserPasswordSignUp() {
    const enterPasswordPrompt = 'Please enter your password: ';
    const enterConfirmPasswordPrompt = 'Confirm Password';
    const attemptsExceeded = 'You exceeded three attempts. Exiting.';
    const passwordsDidNotMatch = 'Passwords didn\'t match.';

    let attempts = 0;

    while (attempts < 3) {
        const password = Util.readInput(enterPasswordPrompt);
        const confirmPassword = Util.readInput(enterConfirmPasswordPrompt);

        if (Util.validatePassword(password, confirmPassword)) return password;
        console.log(passwordsDidNotMatch);
        attempts++;
    }

    console.log(attemptsExceeded);
    process.exit(1);
}

function getUserCredentialsLogin() {
    const user = {userName: null, password: null};

    user.userName = getUserName();
    user.password = Util.readInput('Password');

    return user;
}

function getUserCredentialsSignUp() {
    const user = {userName: null, password: null};

    user.userName = getUserName();
    user.password = getUserPasswordSignUp();

    console.log('Username is: ' + user.userName);
    console.log('Password is: ' + user.password);

    return user;
}

function welcome() {
    console.log('COMP 4000: Distributed File System.');
    console.log('Running Client on: ', ADDRESS);
}

function unMountFuse(err, fuse) {
    if (err) {
        console.log('filesystem at ' + fuse.mnt + ' not unmounted', err);
    } else {
        console.log('filesystem at ' + fuse.mnt + ' unmounted');
    }
}

function mountFuse(err, fuse) {
    if (err) throw err
    console.log('filesystem mounted on ' + fuse.mnt);
}

module.exports = {
    getUserName: getUserName,
    getUserPasswordSignUp: getUserPasswordSignUp,
    getUserCredentialsLogin: getUserCredentialsLogin,
    getUserCredentialsSignUp: getUserCredentialsSignUp,
    welcome: welcome,
    unMountFuse: unMountFuse,
    mountFuse: mountFuse
};