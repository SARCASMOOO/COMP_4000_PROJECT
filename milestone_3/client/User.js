const UI = require('./UI');
const util = require('../common/util');

class User {
    constructor(operations) {
        this.curentUser = {};
        this.operations = operations;
    }

    async signUp(stub, cb) {
        const user = await UI.getUserCredentialsSignUp();
        console.log('User is ', user);
        stub.SignUp(user, (err, response) => this.signUpCallback(err, response, stub, cb));
    }

    signUpCallback(err, response, stub, cb) {
        if (response.status !== 0) console.log('Response: ', response.status);
        console.log('Message: ', response.message);
        cb(stub, this.curentUser);
    }

    async login(stub, cb) {
        const user = await UI.getUserCredentialsLogin();
        stub.LogIn(user, (e, response) => this.loginCallback(e, response, user.username, cb, stub));
    }

    loginCallback = (e, response, username, cb, stub) => {
        if (response.status === 0) {
            console.log('Failed to login. Message: ', response.message);
        } else {
            console.log('Token: :', response.message);
            console.log('Response: :', response.status);
            this.curentUser.username = username
            this.curentUser.token = response.message;
            this.curentUser.isAdmin = !!response.isAdmin;
            this.curentUser.userType = response.userType;
            this.curentUser.expirationDate = response.expirationDate;
            console.log(this.curentUser);
        }
        cb(stub, this.curentUser);
    }

    updatePassword = async (stub, cb) => {
        if (!util.isUserLogedInWrapper(this.curentUser)) {
            cb(stub, this.curentUser);
            return
        }
        ;

        const newPassword = await UI.getUserPasswordSignUp();

        if (!newPassword) {
            console.log('Passwords do not match.');
            cb(stub, this.curentUser);
            return;
        }

        const updateData = {
            username: this.curentUser.username,
            token: this.curentUser.token,
            newPassword: newPassword,
            expirationDate: this.curentUser.expirationDate
        };

        console.log('User for update is: ', this.curentUser);

        stub.updatePassword(updateData, (err, response) => this.updatePasswordCallback(err, response, cb, stub));
    }

    updatePasswordCallback = (err, response, cb, stub) => {
        if (response.status === 0) {
            console.log(`Failed to update password. Message: ', ${response.message}`);
        } else {
            console.log(`Response: :', ${response.message}`);
            this.curentUser.token = null;
        }
        cb(stub, this.curentUser);
    }

    deleteAccount = (stub, cb) => {
        if (!util.isUserLogedInWrapper(this.curentUser)) {
            cb(stub, this.curentUser);
            return;
        }

        const userToDelete = {
            username: this.curentUser.username,
            token: this.curentUser.token,
            expirationDate: this.curentUser.expirationDate
        };

        stub.deleteAccount(userToDelete, (err, response) => this.deleteAccountCallback(err, response, cb, stub));
    }

    deleteAccountCallback = (err, response, cb, stub) => {
        let msg = `Failed to remove account: ${response.message}`;
        if (response.status === 1) msg = 'Account was removed.';
        console.log(msg);
        this.curentUser = {};
        cb(stub, this.curentUser);
    }

    adminCreateUser = async (stub, cb) => {
        console.log('current User is: ', this.curentUser);
        const isAdmin = util.isUserAdmin(this.curentUser);
        console.log('isAdmin ', isAdmin);

        if (isAdmin) {
            console.log('Please enter the details for the account you want to create.');
            const user = await UI.getUserCredentialsSignUp();
            const data = {
                username: user.username, password: user.password,
                userType: user.userType, isAdmin: user.isAdmin,
                expirationDate: this.curentUser.expirationDate,
                adminName: this.curentUser.username, adminToken: this.curentUser.token,
            }

            stub.SignUp(data, (err, response) => this.signUpCallback(err, response, stub, cb));
        } else {
            console.log('You can not run this function. You must be an Admin.');
            cb(stub, this.curentUser);
        }
    }

    adminDeleteAccount = async (stub, cb) => {
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
                adminToken: this.curentUser.token,
                expirationDate: this.curentUser.expirationDate
            };

            console.log('Data is, ', data);

            stub.deleteAccount(data, (err, response) => this.deleteAccountCallback(err, response, cb, stub));
        } else {
            console.log('You can not run this function. You must be an Admin.');
            cb(stub, this.curentUser);
        }
    }

    adminUpdatePassword = async (stub, cb) => {
        const msg = 'Please enter the user name of the user you would like to update.';
        const tempUser = await UI.getUserCredentialsLogin(msg);
        const username = tempUser.username;
        const newPassword = tempUser.password;

        if (!util.isUserAdmin(this.curentUser)) {
            console.log('Please login before trying to update your password and make sure you are an admin.');
            console.log(this.curentUser);
            cb(stub, this.curentUser);
            return;
        }

        const data = {
            username: username, newPassword: newPassword, isAdmin: true,
            expirationDate: this.curentUser.expirationDate
        };

        stub.updatePassword(data, (err, response) => this.updatePasswordCallback(err, response, cb, stub));
    }

    setMountPoint(cb) {
        const question = ['Please enter a mount point.'];
        UI.askQuestion(question).then(results => {
                const mountPoint = results[0];
                console.log('Requested mountpoint is: ', mountPoint);
                this.operations.setMountPoint(cb, this.curentUser, mountPoint);
            }
        );
    }

    createRuleForUserRequest(stub) {
        if(!this.curentUser.username) {
            console.log('Please login first.');
        }

        const question = [
            'Please enter the path you would like to request.',
            'Please type 1 to allow this rule or 0 to deny this rule'
        ];

        const username = this.curentUser.username;
        const permissions = 'r';

        UI.askQuestion(question).then(results => {
                const path = results[0];
                let mode;
                if(results[0] === '1') {
                    mode = 'allow'
                } else {
                    mode = 'deny';
                }

                const rule = {
                    username: username,
                    path: path,
                    permissions: permissions,
                    mode: mode
                }

                console.log('Requested rule is: ', rule);
                stub.createRuleForUser({rule: rule}, (err, response) => {
                    console.log('Response is: ', response);
                });
            }
        );
    }

    readRulesByUserRequest(stub) {
        if(!this.curentUser.username) {
            console.log('Please login first.');
        }

        stub.readRulesByUser({username: this.curentUser.username}, (err, response) => {
            console.log('Response is: ', response);
        })
    }

    updateRuleRequest(stub) {
        if(!this.curentUser.username) {
            console.log('Please login first.');
        }

        const question = [
            'Please enter the path you would like to request.',
            'Please type 1 to allow this rule or 0 to deny this rule.',
            'Please enter the ID of the rule you want to update.'
        ];

        const username = this.curentUser.username;
        const permissions = 'r';

        UI.askQuestion(question).then(results => {
                const path = results[0];
                let mode;
                if(results[0] === '1') {
                    mode = 'allow'
                } else {
                    mode = 'deny';
                }

                const rule = {
                    username: username,
                    path: path,
                    permissions: permissions,
                    mode: mode
                }

                const ruleId = results[2];

                console.log('Requested rule is: ', rule);
                stub.updateRule({
                    ruleId: ruleId,
                    rule: rule
                }, (err, response) => {
                    console.log('Response is: ', response);
                });
            }
        );
    }

    removeRuleRequest() {
    }
}

module.exports = User;

