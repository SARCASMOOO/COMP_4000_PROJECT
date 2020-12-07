const UI = require('./UI');
const Client = require('./Client');
const readline = require('readline');

let curentUser;
let fuse;

// CLIENT FUNCTIONS
function signUp(stub) {
    const user = UI.getUserCredentialsSignUp().then(user => stub.SignUp({
            username: user.userName,
            password: user.password,
            isAdmin: user.isAdmin
        },
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
        })
    );

}

function login(stub) {
    UI.getUserCredentialsLogin().then(
        user => stub.LogIn({username: user.userName, password: user.password},
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
                    if (!response.isAdmin) {
                        user.isAdmin = false;
                    } else {
                        user.isAdmin = response.isAdmin;
                    }

                    curentUser = user;
                    console.log(curentUser);
                }
                update(stub);
            }));
}

function updatePassword(stub, user) {
    if (!curentUser) {
        console.log('Please login before trying to update your password.');
        console.log(curentUser);
        update(stub);
    } else {
        UI.getUserPasswordSignUp().then(newPassword => {
            if (!value) {
                console.log('Passwords do not match.');
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
                    }
                );
            }
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
    if (currentUser && currentUser.isAdmin && currentUser.isAdmin === true && currentUser.token) {
        // If an admin is making this call we want to send the admins credentials as well.
        // If the admin credentials are correct we allow the call to make a new user.
        console.log('Please enter the details for the account you want to create.');
        UI.getUserCredentialsSignUp().then(user => stub.SignUp({
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
            }));
    } else {
        console.log('You can not run this function. You must be an Admin.');
        update(stub);
    }
}

function adminDeleteAccount(stub, currentUser) {
    console.log('currentUser is: ', currentUser);
    if (currentUser && currentUser.isAdmin && currentUser.isAdmin === true && currentUser.token) {
        // If an admin is making this call we want to send the admins credentials as well.
        // If the admin credentials are correct we allow the call to make a new user.
        console.log('Please enter the details for the account you want to delete.');
        const username = UI.getUserName().then(value => {
            let username = value[0];

            stub.deleteAccount({
                    username: username,
                    isAdmin: currentUser.isAdmin,
                    adminName: currentUser.userName,
                    adminToken: currentUser.token
                },
                function (err, response) {
                    if (response.status === 1) {
                        console.log(username, ' was removed.')
                    } else {
                        console.log('Failed to remove account: ', response.message)
                    }
                    update(stub);
                });
        });
    } else {
        console.log('You can not run this function. You must be an Admin.');
        update(stub);
    }
}

// TODO: Admin function to Update credentials for a specific user
// TODO: Need to finsish update function.
function adminUpdatePassword(stub, currentUser) {
    // const msg = 'Please enter the user name of the user you would like to update.';
    // const tempUser = UI.getUserCredentialsLogin(msg);
    // const userName = tempUser.userName;
    // const newPassword = tempUser.password;
    //
    // if (!curentUser) {
    //     console.log('Please login before trying to update your password.');
    //     console.log(curentUser);
    //     update(stub);
    // } else {
    //     if (!currentUser.isAdmin) {
    //         console.log('You must be an admin to run this function.');
    //     } else {
    //         // TODO: Need to check if user is an admin.
    //         stub.updatePassword({username: userName, newPassword: newPassword, isAdmin: true},
    //             function (err, response) {
    //                 if (response.status === 0) {
    //                     console.log('Failed to update password. Message: ', response.message);
    //                 } else {
    //                     console.log('Response: :', response.message);
    //                     curentUser.token = null;
    //                 }
    //                 update(stub);
    //             });
    //     }
    // }
}

// Mount
function mountPoint(stub, curentUser) {
    // if (!curentUser) {
    //     console.log('Please login before trying to mount.');
    //     console.log(curentUser);
    //     update(stub);
    // } else {
    //     const mountPoint = UI.getMountPoint();
    //     stub.addMountPoint({mountPoint: mountPoint}, function (err, response) {
    //         if (response.status === 0) {
    //             console.log(`Failed to mount: ${mountPoint}, Message: ${response.message}`);
    //         } else {
    //             console.log('Response: :', response.message);
    //         }
    //
    //         start(stub);
    //     })
    // }
}

// Loop
async function update(stub) {
    let command;
    const msg = ` Please type one of the following commands: 0 to exit, 1 for sign up, 2 for login, 3 to update password, 4 to remove account.
    If you are an admin type 5 to create a new user, 6 to delete a specific user, and 7 to update a password for a specific user.
    Type 8 to request to mount a folder.`;

    if (isUserLogedIn(curentUser)) {
        console.log('Logged in as: ', curentUser);
    } else {
        console.log('Not logged in.');
    }

    await UI.askQuestion([msg]).then(response => {
        const command = response[0];

        switch (command) {
            case "0":
                unmoundFuse(() => process.exit(1));
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
            case "6":
                adminDeleteAccount(stub, curentUser);
                break;
            case "7":
                adminUpdatePassword(stub, curentUser);
                break;
            case "8":
                mountPoint(stub, curentUser);
                break;
            default:
                console.log('Invalid option. Please select one of the options provided.');
                update(stub);
        }
    })
}

function unmoundFuse(cb) {
    fuse.unmount(err => {
        if (err) {
            console.log('filesystem at ' + fuse.mnt + ' not unmounted', err)
        } else {
            console.log('filesystem at ' + fuse.mnt + ' unmounted')
        }
        cb();
    })
}


function saveFuse(tempFuse) {
    fuse = tempFuse;
}

module.exports = {
    update: update,
    saveFuse: saveFuse
};

