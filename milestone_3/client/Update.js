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