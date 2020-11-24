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
                console.log(typeof response);
                console.log(response.filenames);
                cb(0, response.filenames);
            });
    },
    access: function (path, mode, cb) {
        console.log('access', path, mode);
        cb(0);
    },
    getattr: function (path, cb) {
        console.log('getattr');
        client.getattr({path: path},
            function (err, response) {
                if (err) console.log(err);

                if (response.tempStat) {
                    console.log('here2');
                    response.tempStat.atime = new Date(response.tempStat.atime);
                    response.tempStat.mtime = new Date(response.tempStat.mtime);
                    response.tempStat.ctime = new Date(response.tempStat.ctime);
                    response.tempStat.birthtime = new Date(response.tempStat.birthtime);

                    process.nextTick(cb, null, response.tempStat);
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
                console.log(response.fd);
                cb(0, response.fd);
            });
    },
    read: function (path, fd, buf, len, pos, cb) {
        // TODO: This is not working
        console.log('start read', path, fd, buf, len, pos);
        console.log('buf on start read', buf);

        console.log('hhhhhhhhh');
        client.read({path: path, fd: fd, buf: buf, len: len, pos: pos},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from read2222');
                console.log('Before copy.')
                console.log('Local buf', buf);
                console.log('Reponse buf', response.buf);
                // buf.set(response.buf);
                console.log('After copy.')
                console.log('Local buf', buf);
                console.log('Reponse buf', response.buf);
                console.log('Asci of buffer');

                // console.log(response.buf.toString())
            });
        buf.set(Buffer.from('hello world\n', 'utf8'));
        return cb(0, buf.length);
    },
    opendir: function opendir(path, flags, cb) {
        client.opendir({path: path, flags: flags},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from opendir');
                cb(0);
            });
    },
    statfs: function (path, cb) {
        client.statfs({path: path},
            function (err, response) {
                if (err) console.log(err);
                response.stat.atime = new Date(response.stat.atime);
                response.stat.mtime = new Date(response.stat.mtime);
                response.stat.ctime = new Date(response.stat.ctime);
                response.stat.birthtime = new Date(response.stat.birthtime);

                cb(0, response.stat);
            });
    },
    create: function (path, mode, cb) {
        console.log('create', path, mode);
        fs.writeFileSync('./real' + path, '', {mode: mode});
        cb(0);
    },
    write: function (path, fd, buffer, length, position, cb) {
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
                console.log('Response from unlink');
                cb(0);
            });
    },
    mkdir: function (path, mode, cb) {
        client.mkdir({path: path, mode: mode},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from mkdir');
                cb(0);
            });
    },
    rmdir: function (path, cb) {
        client.rmdir({path: path},
            function (err, response) {
                if (err) console.log(err);
                console.log('Response from unlink');
                cb(0);
            });
    },
    chmod: function (path, mode, cb) {
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