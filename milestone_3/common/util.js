const crpyto = require('crypto');

module.exports = {
    generareRandomToken: function (callback) {
        const bitSize = 64;
        crpyto.randomBytes(bitSize, function (e, buffer) {
            const token = buffer.toString('hex');
            callback(e, token);
        });
    },

    generateExpirationDate: function () {
        const currentDate = new Date();
        return currentDate.getTime();
    },

    isUserAdmin: user => (user && user.token && user.isAdmin && user.token.length > 0),

    isUserLogedIn: user => (user && user.token && user.token.length > 0),

    isUserLogedInWrapper: user => {
        const isUserLogedIn = user => (user && user.token && user.token.length > 0);
        const isLoggedIn = isUserLogedIn(user);

        if (!isLoggedIn) {
            console.log('Please login first.');
            console.log(user);
        }

        return isLoggedIn;
    }
}