const bcrypt = require('bcrypt');
const util = require('../common/util');

module.exports = {
    saveDB: saveDB,
    signUp: signUp,
    logIn: logIn,
    isAuthenticated: isAuthenticated,
    updatePassword: updatePassword,
    deleteAccount: deleteAccount
};

let clientsCollection;

function saveDB(clientsColl) {
    clientsCollection = clientsColl;
}

// Sign Up User
function signUp(call, callback) {
    const user = {
        username: call.request.username,
        password: call.request.password,
        isAdmin: call.request.isAdmin,
        userType: call.request.userType
    };

    console.log('Attempting to sign up user: ', user);

    const saveUser = () => {
        const BCRYPT_SALT_ROUNDS = 12;
        bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS).then(hashedPwd => {
            user.password = hashedPwd;
            addUserToCollection(user, callback);
        });
    };

    const rejectSaveUser = () => {
        const signUpReply = {status: 0, message: 'Failed user already exists'};
        callback(null, signUpReply);
    }

    if (call.request.adminName && call.request.adminToken) {
        // TODO: If this is an admin we need to check expiration token
        if(isTokenExpired(call.request.expirationDate)) {
            const msg = "Token is expired please login first.";
            callback(null, {status: 0, message: msg});
        }

        // Confirm this admin account is correct then move on if not responde with fail.
        const BCRYPT_SALT_ROUNDS = 12;
        clientsCollection.findOne({username: call.request.adminName}).then(user => {
            let signUpReply;

            if (user && user.token === call.request.adminToken) {
                clientsCollection.find({username: call.request.username}).limit(1).count().then(count => {
                    if (count < 1) {
                        console.log('Save user');
                        saveUser();
                    } else {
                        console.log('Reject user');
                        rejectSaveUser();
                    }
                });
            } else {
                signUpReply = {status: 0, message: 'Tokens don\'t match.'};
                callback(null, signUpReply);
            }
        });
    } else {
        // Non admin path
        clientsCollection.find({username: call.request.username}).limit(1).count().then(count => {
            if (count < 1) {
                console.log('Save user');
                saveUser();
            } else {
                console.log('Reject user');
                rejectSaveUser();
            }
        });
    }
}

// Login User
function logIn(call, callback) {
    console.log('Log in');
    const BCRYPT_SALT_ROUNDS = 12;
    const tempUser = {username: call.request.username, password: call.request.password};
    let logInReply;

    clientsCollection.findOne({username: tempUser.username}).then(user => {
        function handleUserToken(e, token) {
            const expirationDate = util.generateExpirationDate();

            clientsCollection.updateOne(
                {username: user.username}, {$set: {token: token, expirationDate: expirationDate}}
            );

            logInReply = {status: 1, message: token,
                isAdmin: user.isAdmin, userType: user.userType,
                expirationDate: expirationDate
            };

            callback(null, logInReply);
        }

        if (user) {
            bcrypt.compare(tempUser.password, user.password, function (err, isMatch) {
                console.log(isMatch);
                if (err) {
                    logInReply = {status: -1, message: 'Failed something went wrong.'};
                    callback(null, logInReply);
                } else if (isMatch) {
                    util.generareRandomToken(handleUserToken);
                } else {
                    logInReply = {status: 0, message: 'Password is not a match!'};
                    callback(null, logInReply);
                }
            })
        } else {
            logInReply = {status: 0, message: 'User was not found.'};
            callback(null, logInReply);
        }
    });
}

function updatePassword(call, callback) {
    const username = call.request.username;
    const token = call.request.token;
    const newPassword = call.request.newPassword;
    const isAdmin = !!call.request.isAdmin;
    const expirationDate = call.request.expirationDate;

    if(isTokenExpired(expirationDate)) {
        const msg = "Token is expired please login first.";
        callback(null, {status: 0, message: msg});
    }

    console.log('Updated password');
    console.log(username);
    console.log(token);
    console.log(newPassword);

    const BCRYPT_SALT_ROUNDS = 12;
    const tempUser = {username: username, password: newPassword};

    clientsCollection.findOne({username: tempUser.username}).then(user => {
        let logInReply;

        console.log('User found:', user);
        console.log('Token received', token);

        if (user && user.token === token ||  isAdmin) {

            bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS).then(hashedPwd => {
                // Logout user by making token invalid. Update password with the new password.
                clientsCollection.updateOne(
                    {username: user.username}, {$set: {token: '', password: hashedPwd}}
                );
                logInReply = {status: 1, message: 'Password updated.'};
                callback(null, logInReply);
            });


        } else {
            logInReply = {status: 0, message: 'Tokens don\'t match.'};
            callback(null, logInReply);
        }
    });
}


function deleteAccount(call, callback) {
    console.log('Delete account');

    const expirationDate = call.request.expirationDate;
    if(isTokenExpired(expirationDate)) {
        const msg = "Token is expired please login first.";
        callback(null, {status: 0, message: msg});
    }

    const username = call.request.username;
    const token = call.request.token;
    const BCRYPT_SALT_ROUNDS = 12;

    console.log(username);
    console.log(token);

    if (call.request.adminName && call.request.adminToken) {
        // Admin path
        clientsCollection.findOne({username: call.request.adminName}).then(user => {
            let logInReply;
            console.log('Submited token', user.token, ', Admin token ', call.request.adminToken);
            if (user && user.token === call.request.adminToken) {
                // Now we checked for an admin we can remove the old user
                deleteAccountHelper(call, callback, true);
            } else {
                logInReply = {status: 0, message: 'Tokens don\'t match.'};
                callback(null, logInReply);
            }
        });
    } else {
        // Non admin path
        deleteAccountHelper(call, callback, false, token)
    }
}

function deleteAccountHelper(call, callback, isAdmin, token) {
    console.log('Delete account helper: ', call.request.username);

    try {
        clientsCollection.findOne({username: call.request.username}).then(user => {
            let reply;

            if (user && user.token === token || isAdmin) {
                clientsCollection.remove(
                    {username: user.username}
                );
                reply = {status: 1, message: 'User removed.'};
                callback(null, reply);

            } else {
                reply = {status: 0, message: 'Tokens don\'t match.'};
                callback(null, reply);
            }
        });
    } catch (e) {
        console.log(e);
        const reply = {status: 0, message: 'Account doesn\'t exist.'};
        callback(null, reply);
    }
}

function addUserToCollection(user, callback) {
    clientsCollection.insertOne(user).then(() => {
        const response = {status: 1, message: 'Success'};
        callback(null, response);
    });
}

// This function is not being used.
function isAuthenticated(expirationDate) {
    console.log('Is authenticated');
    // TODO: Update password, delete account need to check the token isn't expired.
}

function isTokenExpired(startTime) {
    const timeToLive = 2000000;
    const endTime = new Date().getTime();
    // return (endTime - startTime > timeToLive);
    // NOTE: This is for testing purposes.
    return false;
}
