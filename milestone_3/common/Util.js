const crpyto = require('crypto');
const readlineSync = require("readline-sync");

const readInput = msg => readlineSync.question(msg);
const validatePassword = (password, confirmPassword) => password === confirmPassword;

const generareRandomToken = function (callback) {
    const bitSize = 64;
    crpyto.randomBytes(bitSize, function (e, buffer) {
        const token = buffer.toString('hex');
        callback(e, token);
    });
}

const generateExpirationDate = function () {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3);
    return currentDate;
}

module.exports = {
    generateExpirationDate: generateExpirationDate,
    generareRandomToken: generareRandomToken,
    readInput: readInput,
    validatePassword: validatePassword
}