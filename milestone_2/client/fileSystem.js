const fs = require('fs');
const Fuse = require('fuse-native');

const ops = {
    readdir: function (path, cb) {
        const filenames = fs.readdirSync( "./real" + path);
        console.log(filenames);
        cb(0, filenames);
    },
    access: function (path, mode, cb) {
      return cb(0);
    },
    getattr: function (path, cb) {
        try {
            const tempStat = fs.statSync('./real' + path);
            return process.nextTick(cb, null, tempStat);
        } catch (e) {
            console.log(e);
            return process.nextTick(cb, Fuse.ENOENT);
        }
    },
    open: function (path, flags, cb) {
        const fd = fs.openSync('./real' + path, flags);
        return process.nextTick(cb, 0, fd);
    },
    read: function (path, fd, buf, len, pos, cb) {
        const size = fs.readSync(fd, buf, 0, len, pos);
        return process.nextTick(cb, size);
    },
    opendir: function opendir(path, flags, cb) {
        const res = fs.opendirSync('./real' + path);
        cb(0);
    },
    statfs: function (path, cb) {
        const tempStat = fs.statSync('./real' + path);
        return cb(0, tempStat);
    },
    create: function (path, mode, cb) {
        const fd = fs.writeFileSync('./real' + path, '', {mode: mode});
        cb(0, fd);
    },
    write: function (path, fd, buffer, length, position, cb) {
        // TODO: Unable to write. File is read only.
        console.log('Write was called');
        fs.writeSync(fd, buffer, 0, length, position);
        return cb(length);
    },
    unlink: function(path, cb) {
        fs.unlinkSync('./real' + path);
        return cb(0);
    },
    mkdir: function(path, mode, cb) {
        fs.mkdirSync('./real' + path, {mode: mode});
        return cb(0);
    },
    rmdir: function(path, cb) {
        fs.rmdirSync('./real' + path);
        return cb(0);
    }
}

module.exports = {
    ops: ops
};
