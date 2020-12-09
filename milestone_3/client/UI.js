const readline = require('readline');

const readInput = (rl, question) => {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
        })
    });
}

async function askQuestion(questions) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const questionPromises = [];
    let question;

    for (question of questions) {
        questionPromises.push(await readInput(rl, question));
    }

    rl.close();

    return Promise.all(questionPromises);
}

function getUserName(msg) {
    const enterUserNamePrompt = 'Please enter your username.';
    let tempMsg = msg ? msg : enterUserNamePrompt;
    return askQuestion([tempMsg]);
}

async function getUserPasswordSignUp() {
    const enterPasswordPrompt = 'Please enter your password: ';
    const enterConfirmPasswordPrompt = 'Confirm Password';

    return new Promise((accept, reject) => {
        const passwordPromise = askQuestion([enterPasswordPrompt, enterConfirmPasswordPrompt]);
        passwordPromise.then(value => {
            if (value[0] === value[1]) accept(value[0]);
            accept(false);
        });
    })
}


// TODO: This needs to store the users token.
async function getUserCredentialsLogin(msg) {
    const user = {userName: null, password: null};

    return new Promise((accept, reject) => {
        const passwordPromise = askQuestion(['Please enter your username.', 'Please enter your password.']);
        passwordPromise.then(value => {
            user.username = value[0];
            user.password = value[1];
            accept(user);
        });
    });
}

async function getUserCredentialsSignUp() {
    const user = {username: null, password: null, isAdmin: null};
    const question = [
        'Please enter your username.',
        'Please enter your password.',
        'Type 1 if you are an admin, 2 for a trusted user, and anything else for a public user.'];

    return new Promise((accept, reject) => {
        const promise = askQuestion(question);
        promise.then(value => {
            user.username = value[0];
            user.password = value[1];
            user.isAdmin = (value[2] === '1');

            if (value[2] === '1') {
                user.userType = 'admin'
            } else if (value[2] === '2') {
                user.userType = 'trusted';
            } else {
                user.userType = 'public';
            }
            accept(user);
        });
    });
}

module.exports = {
    getUserName: getUserName,
    getUserPasswordSignUp: getUserPasswordSignUp,
    getUserCredentialsLogin: getUserCredentialsLogin,
    getUserCredentialsSignUp: getUserCredentialsSignUp,
    askQuestion: askQuestion
};

