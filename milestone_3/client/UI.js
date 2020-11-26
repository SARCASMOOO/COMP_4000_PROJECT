const readlineSync = require("readline-sync");
const validatePassword = (password, confirmPassword) => password === confirmPassword;
const readInput = msg => readlineSync.question(msg);

function getUserName() {
    const enterUserNamePrompt = 'Please enter your username.';
    return readInput(enterUserNamePrompt);
}

function getUserIsAdminSignUp() {
    const isAdminPrompt = 'Please type 1 to make an admin account or anything else to not have admin: ';
    const isAdmin = readInput(isAdminPrompt);
    return (isAdmin === '1');
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

    user.userName = getUserName();
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
    user.isAdmin = getUserIsAdminSignUp();

    console.log('Username is: ' + user.userName);
    console.log('Password is: ' + user.password);

    return user;
}

module.exports = {
    getUserName: getUserName,
    getUserPasswordSignUp: getUserPasswordSignUp,
    getUserCredentialsLogin: getUserCredentialsLogin,
    getUserCredentialsSignUp: getUserCredentialsSignUp,
};

