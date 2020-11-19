const fs = require('fs');
const Fuse = require('fuse-native');

let client;

const ops = {
    setClient: function (tempClient) {
        client = tempClient;
    },
    readdir: function (path, cb) {
        client.readdir({path: path},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from readdir');
            });

        const filenames = fs.readdirSync("./real" + path);
        console.log('readdir', filenames);
        cb(0, filenames);
    },
    access: function (path, mode, cb) {
        client.access({path: path, mode: mode},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from access');
            });

        console.log('access', path, mode);
        return cb(0);
    },
    getattr: function (path, cb) {
        client.getattr({path: path},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from getattr');
            });

        console.log('getattr', path);
        try {
            const tempStat = fs.statSync('./real' + path);
            return process.nextTick(cb, null, tempStat);
        } catch (e) {
            console.log(e);
            return process.nextTick(cb, Fuse.ENOENT);
        }
    },
    open: function (path, flags, cb) {
        client.open({path: path, flags: flags},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from open');
            });

        console.log('open', path, flags);
        const fd = fs.openSync('./real' + path, flags);
        return process.nextTick(cb, 0, fd);
    },
    read: function (path, fd, buf, len, pos, cb) {
        client.read({path: path, fd: fd, buf: buf, len: len, pos: pos},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from read');
            });

        console.log('read', path, fd, buf, len, pos);
        const size = fs.readSync(fd, buf, 0, len, pos);
        return process.nextTick(cb, size);
    },
    opendir: function opendir(path, flags, cb) {
        client.opendir({path: path, flags: flags},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from opendir');
            });

        console.log('opendir', path, flags);
        const res = fs.opendirSync('./real' + path);
        cb(0);
    },
    statfs: function (path, cb) {
        client.statfs({path: path},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from statfs');
            });

        console.log('statfs', path);
        const tempStat = fs.statSync('./real' + path);
        console.log(tempStat);
        return cb(0, tempStat);
    },
    create: function (path, mode, cb) {
        client.create({path: path, mode: mode},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from create');
            });

        console.log('create', path, mode);
        fs.writeFileSync('./real' + path, '', {mode: mode});
        cb(0);
    },
    write: function (path, fd, buffer, length, position, cb) {
        client.write({path: path, fd: fd, buffer: buffer, length: length, position: position},
            function (err, response) {
                // if (err) console.log(err);
                console.log('Response from write');
            });

        try {
            console.log('write11', path, fd, buffer, length, position, cb);
            // TODO: Unable to write. File is read only.
            console.log('Write was called');
            fs.write(fd, buffer, 0, length, position, function (e) {
                console.log(e);
                console.log('hello123123')
                cb(length);
            });
        } catch (e) {
            console.log(e);
        }

        return cb(length);
    },
    unlink: function (path, cb) {
        client.unlink({path: path},
            function (err, response) {
                if (err) console.log(err);
                // console.log('Response from unlink');
            });
        console.log('unlink');
        fs.unlinkSync('./real' + path);
        return cb(0);
    },
    mkdir: function (path, mode, cb) {
        console.log('mkdir');
        client.mkdir({path: path, mode: mode},
            function (err, response) {
                if (err) console.log(err);
                // console.log('Response from unlink');
            });
        fs.mkdirSync('./real' + path, {mode: mode});
        return cb(0);
    },
    rmdir: function (path, cb) {
        client.rmdir({path: path},
            function (err, response) {
                if (err) console.log(err);
                // console.log('Response from unlink');
            });

        console.log('rmdir');
        fs.rmdirSync('./real' + path);
        return cb(0);
    },
    chmod: function (path, mode, cb) {
        client.chmod({path: path, mode: mode},
            function (err, response) {
                if (err) console.log(err);
                // console.log('Response from chmod');
            });
        fs.chmodSync('./real' + path, mode);
        cb(0);
    }
}

module.exports = {
    ops: ops
};
