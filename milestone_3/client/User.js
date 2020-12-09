const UI = require('./UI');
const util = require('../common/util');

class User {
    constructor() {
        this.curentUser = {};
    }

    async signUp(stub) {
        const user = await UI.getUserCredentialsSignUp();
        console.log('User is ', user);
        stub.SignUp(user, this.signUpCallback);
    }

    signUpCallback(err, response) {
        if (response.status !== 0) console.log('Response: :', response.status);
        console.log('Message: ', response.message);
    }

    async login(stub) {
        const user = await UI.getUserCredentialsLogin();
        stub.LogIn(user, (e, response) => this.loginCallback(e, response, user.username));
    }

    loginCallback = (e, response, username) => {
        if (response.status === 0) {
            console.log('Failed to login. Message: ', response.message);
        } else {
            console.log('Token: :', response.message);
            console.log('Response: :', response.status);
            this.curentUser.username = username
            this.curentUser.token = response.message;
            this.curentUser.isAdmin = !!response.isAdmin;
            console.log(this.curentUser);
        }
    }

    async updatePassword(stub) {
        if (!util.isUserLogedInWrapper(this.curentUser)) return;

        const newPassword = await UI.getUserPasswordSignUp();

        if (!newPassword) {
            console.log('Passwords do not match.');
            return;
        }

        const updateData = {
            username: this.curentUser.username,
            token: this.curentUser.token,
            newPassword: newPassword
        };

        console.log('User for update is: ', this.curentUser);

        stub.updatePassword(updateData, this.updatePasswordCallback);
    }

    updatePasswordCallback = (err, response) => {
        if (response.status === 0) {
            console.log(`Failed to update password. Message: ', ${response.message}`);
        } else {
            console.log(`Response: :', ${response.message}`);
            this.curentUser.token = null;
        }
    }

    deleteAccount = stub => {
        if (!util.isUserLogedInWrapper(this.curentUser)) return;

        const userToDelete = {
            username: this.curentUser.username,
            token: this.curentUser.token
        };

        stub.deleteAccount(userToDelete, this.deleteAccountCallback);
    }

    deleteAccountCallback = (err, response) => {
        let msg = `Failed to remove account: ${response.message}`;
        if (response.status === 1) msg = 'Account was removed.';
        console.log(msg);
    }

    adminCreateUser = async stub => {
        console.log('current User is: ', this.curentUser);
        const isAdmin = util.isUserAdmin(this.curentUser);

        if (isAdmin) {
            console.log('Please enter the details for the account you want to create.');
            const user = await UI.getUserCredentialsSignUp();
            const data = {
                username: user.username, password: user.password,
                isAdmin: user.isAdmin, adminName: this.curentUser.username, adminToken: this.curentUser.token
            }
            stub.SignUp(data, this.signUpCallback);
        } else {
            console.log('You can not run this function. You must be an Admin.');
        }
    }

    adminDeleteAccount = async stub => {
        console.log('currentUser is: ', this.curentUser);
        const isAdmin = util.isUserAdmin(this.curentUser);

        if (isAdmin) {
            console.log('Please enter the details for the account you want to delete.');
            const value = await UI.getUserName();
            const username = value[0];

            const data = {
                username: username,
                isAdmin: this.curentUser.isAdmin,
                adminName: this.curentUser.username,
                adminToken: this.curentUser.token
            };

            console.log('Data is, ', data);

            stub.deleteAccount(data, this.deleteAccountCallback);
        } else {
            console.log('You can not run this function. You must be an Admin.');
        }
    }

     adminUpdatePassword = async stub => {
        const msg = 'Please enter the user name of the user you would like to update.';
        const tempUser = await UI.getUserCredentialsLogin(msg);
        const username = tempUser.username;
        const newPassword = tempUser.password;

        if (!util.isUserAdmin(this.curentUser)) {
            console.log('Please login before trying to update your password and make sure you are an admin.');
            console.log(this.curentUser);
            return;
        }

        const data = {username: username, newPassword: newPassword, isAdmin: true};
        stub.updatePassword(data, this.updatePasswordCallback);
    }
}

module.exports = User;

