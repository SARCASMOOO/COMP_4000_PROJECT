const readlineSync = require("readline-sync");
const UI = require('./UI');
const Client = require('./Client');

let curentUser;

const readInput = msg => readlineSync.question(msg);

// CLIENT FUNCTIONS
function signUp(stub) {
    const user = UI.getUserCredentialsSignUp();

    stub.SignUp({username: user.userName, password: user.password, isAdmin: user.isAdmin},
        function (err, response) {
            console.log('Sign up reply');

            if (response.status === 0) {
                console.log('Message: ', response.message);
            } else {
                console.log('Response: :', response.status);
                console.log('Message: :', response.message);
                curentUser = user;
            }
            update(stub);
        });
}

function login(stub) {
    const user = UI.getUserCredentialsLogin();
    stub.LogIn({username: user.userName, password: user.password},
        function (e, response) {
            console.log('Logged in called');
            console.log('user is: ', user);
            if (response.status === 0) {
                console.log('Failed to login. Message: ', response.message);
            } else {

                console.log('Token: :', response.message);
                console.log('Response: :', response.status);

                const token = response.message;
                user.token = token;
                if(!response.isAdmin) {
                    user.isAdmin = false;
                } else {
                    user.isAdmin = response.isAdmin;
                }

                curentUser = user;
                console.log(curentUser);
            }
            update(stub);
        });
}

function updatePassword(stub, user) {
    const newPassword = UI.getUserPasswordSignUp();

    if (!curentUser) {
        console.log('Please login before trying to update your password.');
        console.log(curentUser);
        update(stub);
    } else {
        stub.updatePassword({username: curentUser.userName, token: curentUser.token, newPassword: newPassword},
            function (err, response) {
                if (response.status === 0) {
                    console.log('Failed to update password. Message: ', response.message);
                } else {
                    console.log('Response: :', response.message);
                    curentUser.token = null;
                }
                update(stub);
            });
    }
}

function deleteAccount(stub) {
    if (!curentUser) {
        console.log('Please login before trying to delete your account.');
        update(stub);
    } else {
        stub.deleteAccount({username: curentUser.userName, token: curentUser.token},
            function (err, response) {
                if (response.status === 1) {
                    console.log(curentUser.userName, ' was removed.')
                } else {
                    console.log('Failed to remove account: ', response.message)
                }
                update(stub);
            });
    }
}

const isUserLogedIn = (user) => (user && user.token && user.token.length > 0);

// ADMIN FUNCTIONS
function adminCreateUser(stub, currentUser) {
    console.log('currentUser is: ', currentUser);
    if(currentUser && currentUser.isAdmin && currentUser.isAdmin === true && currentUser.token) {
        // If an admin is making this call we want to send the admins credentials as well.
        // If the admin credentials are correct we allow the call to make a new user.
        console.log('Please enter the details for the account you want to create.');
        const user = UI.getUserCredentialsSignUp();

        stub.SignUp({
                username: user.userName, password: user.password,
                isAdmin: user.isAdmin, adminName: currentUser.userName, adminToken: currentUser.token
            },
            function (err, response) {
                if (response.status === 0) {
                    console.log('Message: ', response.message);
                } else {
                    console.log('Response: :', response.status);
                    console.log('Message: :', response.message);
                }
                update(stub);
            });
    } else {
        console.log('You can not run this function. You must be an Admin.');
        update(stub);
    }
}


// TODO: Update credentials for a specific user
// Loop
function update(stub) {
    let command;
    const msg = ` Please type one of the following commands: 0 to exit, 1 for sign up, 2 for login, 3 to update password, 4 to remove account.
    If you are an admin type 5 to create a new user, 6 to update a password for a specific user, and 7 to delete a specific user.`;

    if(isUserLogedIn(curentUser)) {
        console.log('Logged in as: ', curentUser);
    } else {
        console.log('Not logged in.');
    }

    command = readInput(msg);
    switch (command) {
        case "0":
            process.exit(1);
            break;
        case "1":
            signUp(stub);
            break;
        case "2":
            login(stub);
            break;
        case "3":
            updatePassword(stub);
            break;
        case "4":
            deleteAccount(stub);
            break;
        case "5":
            adminCreateUser(stub, curentUser);
            break;
        default:
            console.log('Invalid option. Please select one of the options provided.');
            update(stub);
    }
}

module.exports = {
    update: update
};

