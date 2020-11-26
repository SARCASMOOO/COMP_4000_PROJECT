const UI = require('./UI');
const Client = require('./Client');
const readlineSync = require("readline-sync");

let curentUser;

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

function update(stub) {
    let command;
    let counter = 0;
    const msg = 'Please type one of the following commands: 0 to exit, 1 for login, 2 for signup, 3 to update password, 4 to remove account.';

    command = readInput(msg);
    switch (command) {
        case "0":
            process.exit(1);
            break;
        case "1":
            login(stub);
            break;
        case "2":
            signUp(stub);
            break;
        case "3":
            updatePassword(stub);
            break;
        case "4":
            deleteAccount(stub);
            break;
        default:
            console.log('Invalid option. Please select one of the options provided.');
    }
}

module.exports = {
    update: update
}