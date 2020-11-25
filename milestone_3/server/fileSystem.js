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

    access: function (call, callback) {
        fs.accessSync(root_file_path + call.request.path);
        callback(null, {response: 0});
    },

    getattr: function (call, callback) {
        try {
            const stats = fs.statSync(root_file_path + call.request.path);
            callback(null, {tempStat: stats});
        } catch (e) {
            console.log('error', e);
            callback(null, {response: Fuse.ENOENT});
        }
    },

    open: function (call, callback) {
        console.log('open');
        const fd = fs.openSync(root_file_path + call.request.path, call.request.flags);
        callback(null, {fd: fd});
    },

    read: function (call, callback) {
        const {path, fd, len, pos, buf} = call.request;
        console.log('read(%s, %d, %d, %d)', path, fd, len, pos);
        const size = fs.readSync(fd, buf, 0, len, pos);
        console.log('buf: ', buf, ', size: ', size);
        if (!size) callback(null, 0);
        callback(null, {size: size, buf: buf});
    }
}

module.exports = {
    readdir: ops.readdir,
    access: ops.access,
    getattr: ops.getattr,
    open: ops.open,
    read: ops.read
};