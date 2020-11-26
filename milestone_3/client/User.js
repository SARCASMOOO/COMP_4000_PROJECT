const UI = require('./UI');

// GRPC Stub
let stub;

// User session
let curentUser;

function signUp(stub) {
    const user = UI.getUserCredentialsSignUp();
    console.log('hello', stub.SignUp);

    stub.SignUp({username: user.userName, password: user.password},
        function (err, response) {
            console.log('Returned sign up');
            if (response.status === 0) {
                console.log('Message: ', response.message);
            } else {
                console.log('Response: :', response.status);
                console.log('Message: :', response.message);
            }
        });
}

// function login() {
//     const user = UI.getUserCredentialsLogin();
//     stub.LogIn({username: user.userName, password: user.password},
//         function (e, response) {
//             if (response.status === 0) {
//                 console.log('Failed to login. Message: ', response.message);
//             } else {
//                 console.log('Token: :', response.message);
//                 console.log('Response: :', response.status);
//
//                 const token = response.message;
//                 user.token = token;
//                 curentUser = user;
//                 console.log(curentUser);
//             }
//         });
// }
//
// function updatePassword(user) {
//     const newPassword = UI.getUserPasswordSignUp();
//
//     if (!curentUser) {
//         console.log('Please login before trying to update your password.');
//         console.log(curentUser);
//     } else {
//         stub.updatePassword({username: curentUser.userName, token: curentUser.token, newPassword: newPassword},
//             function (err, response) {
//                 if (response.status === 0) {
//                     console.log('Failed to update password. Message: ', response.message);
//                 } else {
//                     console.log('Response: :', response.message);
//                     curentUser.token = null;
//                 }
//             });
//     }
// }
//
// function deleteAccount(client) {
//     if (!curentUser) {
//         console.log('Please login before trying to delete your account.');
//         update();
//     } else {
//         stub.deleteAccount({username: curentUser.userName, token: curentUser.token},
//             function (err, response) {
//                 if (response.status === 1) {
//                     console.log(curentUser.userName, ' was removed.')
//                 } else {
//                     console.log('Failed to remove account: ', response.message)
//                 }
//             });
//     }
// }

module.exports = {
    // deleteAccount: deleteAccount,
    // updatePassword: updatePassword,
    // login: login,
    signUp: signUp
};