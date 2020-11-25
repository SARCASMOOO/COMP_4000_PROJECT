const fs = require('fs');
const Fuse = require('fuse-native');

const root_file_path = '/Users/main/Coding/school/COMP_4000/milestone_3/client/real';

const ops = {
    readdir: function (call, callback) {
        const filenames = fs.readdirSync(root_file_path + call.request.path);
        console.log('server readdir');
        console.log('filenames is: ', filenames);
        callback(null, {filenames: filenames});
    },
}

module.exports = {
    readdir: ops.readdir,
};