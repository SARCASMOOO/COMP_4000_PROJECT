const fs = require('fs');
const Fuse = require('fuse-native');

let client;

const ops = {
    setClient: function (tempClient) {
        client = tempClient;
    },
    readdir: function (path, cb) {
        console.log('readdir');
        client.readdir({path: path},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from readdir');
                console.log(response);
                cb(0, response);
            });
    },
    access: function (path, mode, cb) {
        console.log('access');
        client.access({path: path, mode: mode},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from access');
                console.log(response);
                cb(0);
            });
    },
    getattr: function (path, cb) {
        console.log('getattr');
        client.getattr({path: path},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from getattr', path);
                if(response.stat) {
                    process.nextTick(cb, null, response.stat);
                } else {
                    process.nextTick(cb, Fuse.ENOENT);
                }
            });
    },
    open: function (path, flags, cb) {
        console.log('open');
        client.open({path: path, flags: flags},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from open');
                process.nextTick(cb, 0, response.fd);
            });
    },
    read: function (path, fd, buf, len, pos, cb) {
        console.log('read');
        client.read({path: path, fd: fd, buf: buf, len: len, pos: pos},
            function (err, response) {
                if (err) console.log(err);
                console.log('read', path, fd, buf, len, pos);
                console.log('Response from read');
                process.nextTick(cb, response.size);
            });
    },
    opendir: function opendir(path, flags, cb) {
        console.log('opendir');
        client.opendir({path: path, flags: flags},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from opendir');
                cb(0);
            });
    },
    statfs: function (path, cb) {
        console.log('statfs');
        client.statfs({path: path},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from statfs');
                // console.log(response);
                cb(0, response.tempStat);
            });
    },
    create: function (path, mode, cb) {
        console.log('create');
        client.create({path: path, mode: mode},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from create');
                console.log('create', path, mode);
                cb(0);
            });


    },
    write: function (path, fd, buffer, length, position, cb) {
        console.log('write');
        client.write({path: path, fd: fd, buffer: buffer, length: length, position: position},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from write');
                cb(length);
            });
    },
    unlink: function (path, cb) {
        console.log('unlink');
        client.unlink({path: path},
            function (err, response) {
                if (err) console.log(err);
                // console.log('Response from unlink');
                cb(0);
            });
    },
    mkdir: function (path, mode, cb) {
        console.log('mkdir');
        client.mkdir({path: path, mode: mode},
            function (err, response) {
                if (err) console.log(err);
                // console.log('Response from unlink');
                cb(0);
            });
    },
    rmdir: function (path, cb) {
        console.log('rmdir');
        client.rmdir({path: path},
            function (err, response) {
                if (err) console.log(err);
                // console.log('Response from unlink');
                console.log('rmdir');
                cb(0);
            });
    },
    chmod: function (path, mode, cb) {
        console.log('chmod');
        client.chmod({path: path, mode: mode},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from chmod');
                cb(0);
            });
    }
}

module.exports = {
    ops: ops
};
