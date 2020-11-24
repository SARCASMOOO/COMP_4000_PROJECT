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
        currentDate.setDate(currentDate.getDate() + 3);
        return currentDate;
    }
}