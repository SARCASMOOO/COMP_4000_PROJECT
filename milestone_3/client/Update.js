const UI = require('./UI');
const util = require('../common/util');

// Loop
class UpdateLoop {
    constructor(user, fuseWrapper) {
        this.user = user;
        this.fuseWrapper = fuseWrapper;
        this.curentUser = {};
    }

    update = async (stub, curentUser) => {
        this.curentUser = curentUser;

        const msg = ` Please type one of the following commands: 0 to exit, 1 for sign up, 2 for login, 3 to update password, 4 to remove account.
    If you are an admin type 5 to create a new user, 6 to delete a specific user, and 7 to update a password for a specific user.
    Type 8 to request to mount a folder, 9  to create a new rule, 10 to read rules for a user, type 11 to update a rule.`;

        if (util.isUserLogedIn(curentUser)) {
            console.log('Logged in as: ', curentUser);
        } else {
            console.log('Not logged in.');
        }

        await UI.askQuestion([msg]).then(response => {
            const command = response[0];

            switch (command) {
                case "0":
                    this.fuseWrapper.unmountFuse(() => process.exit(1));
                    break;
                case "1":
                    this.user.signUp(stub, this.update);
                    break;
                case "2":
                    this.user.login(stub, this.update);
                    break;
                case "3":
                    this.user.updatePassword(stub, this.update);
                    break;
                case "4":
                    this.user.deleteAccount(stub, this.update);
                    break;
                case "5":
                    this.user.adminCreateUser(stub, this.update);
                    break;
                case "6":
                    this.user.adminDeleteAccount(stub, this.update);
                    break;
                case "7":
                    this.user.adminUpdatePassword(stub, this.update);
                    break;
                case "8":
                    this.user.setMountPoint(this.update);
                    break;
                case "9":
                    this.user.createRuleForUserRequest(stub, this.update);
                    break;
                case "10":
                    this.user.readRulesByUserRequest(stub, this.update);
                    break;
                case "11":
                    this.user.updateRuleRequest(stub, this.update);
                    break;
                default:
                    console.log('Invalid option. Please select one of the options provided.');
                    this.update(stub);
            }
        })
    }
}


module.exports = UpdateLoop;