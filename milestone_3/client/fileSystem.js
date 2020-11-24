const fs = require('fs');
const Fuse = require('fuse-native');

let client;

const ops = {
    setClient: function (tempClient) {
        client = tempClient;
    },

    // Called when a directory is being listed
    readdir: function (path, cb) {
        console.log('ReadDIR123');
        console.log('./real' + path);

        const filenames = fs.readdirSync('./real' + path);
        if (filenames) return process.nextTick(cb, 0, filenames);
        return process.nextTick(cb, 0);
    },

    // Called before the filesystem accessed a file
    access: function (path, mode, cb) {
        fs.accessSync('./real' + path, mode);
        return process.nextTick(cb, 0);
    },


    // Called when a path is being stat'ed
    getattr: function (path, cb) {
        console.log('getattr(%s)', path);
        try {
            const stats = fs.statSync('./real' + path);
            return process.nextTick(cb, 0, stats);
        } catch (e) {
            console.log('error', e);
            return process.nextTick(cb, Fuse.ENOENT);
        }
    },

    // Called when a path is being opened
    open: function (path, flags, cb) {
        console.log('open(%s, %d)', path, flags)
        const fd = fs.openSync('./real' + path, flags);
        console.log('file descriptor: ', fd);
        process.nextTick(cb, 0, fd);
    },

    // Called when contents of a file is being read
    read: function (path, fd, buf, len, pos, cb) {
        console.log('read(%s, %d, %d, %d)', path, fd, len, pos);
        const size = fs.readSync(fd, buf, 0, len, pos);
        console.log('buf: ', buf, ', size: ', size);
        if (!size) return process.nextTick(cb, 0);
        return process.nextTick(cb, size);
    },

    // Called when a directory is being opened
    opendir: function (path, flags, cb) {
        const dir = fs.opendirSync('./real' + path);
        console.log('dir is: ', dir);
        return process.nextTick(cb, 0);
    },

    // Called when the filesystem is being stat'ed.
    statfs: function (path, cb) {
        const statfs = fs.statSync('./real' + path);
        return process.nextTick(cb, 0, statfs);
    },

    // Called when a new file is being opened.
    create: function (path, mode, cb) {
        fs.writeFileSync('./real' + path, '', {mode: mode});
        return process.nextTick(cb, 0);
    },

    // Called when a file is being written to.
    write: function (path, fd, buffer, length, position, cb) {
        console.log('write file data is: ', buffer.toString());
        console.log('fd is: ', fd);
        fs.writeSync(fd, 'hello', position);
        return process.nextTick(cb, 5);
    }
}

module.exports = {ops: ops};