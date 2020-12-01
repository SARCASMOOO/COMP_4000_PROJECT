const fs = require('fs');
const Fuse = require('fuse-native');

let client;

const ops = {
    setClient: function (tempClient) {
        client = tempClient;
    },

    // Called when a directory is being listed.
    readdir: function (path, cb) {
        client.readdir({path: path},
            function (err, response) {
                // console.log('here', response);
                if (err) console.log(err);
                if (response) return process.nextTick(cb, 0, response.filenames);
                return process.nextTick(cb, 0);
            });
    },

    // Called before the filesystem accessed a file.
    access: function (path, mode, cb) {
        client.access({path: path, mode: mode},
            function (err, response) {
                // console.log('here', response);
                if (err) console.log(err);
                return process.nextTick(cb, 0);
            });
    },


    // Called when a path is being stat'ed.
    getattr: function (path, cb) {
        client.getattr({path: path},
            function (err, response) {
                // console.log('here11', response);
                // if (err) console.log(err);

                if (response.tempStat) {
                    // console.log('111');
                    response.tempStat.atime = new Date(response.tempStat.atime);
                    response.tempStat.mtime = new Date(response.tempStat.mtime);
                    response.tempStat.ctime = new Date(response.tempStat.ctime);
                    response.tempStat.birthtime = new Date(response.tempStat.birthtime);

                    process.nextTick(cb, 0, response.tempStat);
                } else {
                    process.nextTick(cb, Fuse.ENOENT);
                }
            });
    },

    // Called when a path is being opened.
    open: async function (path, flags, cb) {
        const tempPromise = new Promise( (resolve, reject) => {
            client.open({path: path, flags: flags}, function (err, response) {
                if (err) console.log(err);
                // console.log('open fd is: ', response.fd);
                // console.log('response is: ', response);
                resolve(response.fd);
            })
        });

        await tempPromise.then(function (fd) {
            process.nextTick(cb, 0, fd);
        });
    },

    // Called when contents of a file is being read.
    read: function (path, fd, buf, len, pos, cb) {
        client.read({ path, fd, buf, len, pos}, function (err, response) {
            // if (err) console.log(err);
            buf.set(response.buf)
            process.nextTick(cb, buf.length);
        });
    },

    // Called when a directory is being opened.
    opendir: function (path, flags, cb) {
        client.opendir({path: path, flags: flags}, function (err, response) {
            process.nextTick(cb, 0);
        });
    },

    // Called when the filesystem is being stat'ed.
    statfs: function (path, cb) {
        client.statfs({path: path}, function (err, response) {
            process.nextTick(cb, 0, response.statfs);
        });
    },

    // Called when a new file is being opened.
    create: function (path, mode, cb) {
        client.create({path: path, mode: mode}, function (err, response) {
            process.nextTick(cb, 0);
        });
    },

    // Called when a file is being unlinked.
    unlink: function (path, cb) {
        client.unlink({path: path}, function (err, response) {
            process.nextTick(cb, 0);
        });
    },

    // Called when a new directory is being created.
    mkdir: function (path, mode, cb) {
        client.mkdir({path: path, mode: mode}, function (err, response) {
            process.nextTick(cb, 0);
        })
    },

    // Called when a directory is being removed.
    rmdir: function (path, cb) {
        client.rmdir({path: path}, function (err, response) {
            process.nextTick(cb, 0);
        })
    },

    // Called when the mode of a path is being changed.
    chmod: function (path, mode, cb) {
        client.chmod({path: path, mode: mode}, function (err, response) {
            process.nextTick(cb, 0);
        })
    }

    // Called when a file is being written to.
    // write: function (path, fd, buffer, length, position, cb) {
    //     console.log('write file data is: ', buffer.toString());
    //     console.log('fd is: ', fd);
    //     fs.writeSync(fd, 'hello', position);
    //     return process.nextTick(cb, 5);
    // }
}

module.exports = {ops: ops};