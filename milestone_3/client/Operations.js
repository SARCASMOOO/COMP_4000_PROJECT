const fs = require('fs');

class Operations {
    constructor(stub, getCurrentUser) {
        this.stub = stub;
        console.log(this.stub);
        this.ENOENT = -2;
        this.mountPoint = './';
        this.getCurrentUser = getCurrentUser;
    }

    setMountPoint(cb, curentUser, mountPoint) {
        if (!curentUser.token) {
            console.log('Please login before trying to mount a folder.');
        }

        this.stub.setMountPoint({
            mountPoint: mountPoint, username: curentUser.username,
            userType: curentUser.userType,
            expirationDate: curentUser.expirationDate
        }, (err, response) => {
            if (err) console.log(err);
            // TODO: Request mount point then save it if allowed.
            console.log('Requested mount point is: ', mountPoint);
            console.log('Response is: ', response);
            if (response.status) {
                console.log(mountPoint, ' successfully mounted.');
                this.mountPoint = mountPoint;
            }
            cb(this.stub, curentUser);
        });
    }

    getOps() {
        return {
            // Called when a directory is being listed.
            readdir: (path, cb) => {
                const currentUser = this.getCurrentUser();
                this.stub.readdir({
                        path: path, mountpoint: this.mountPoint,
                        username: currentUser.username,
                        userType: currentUser.userType,
                        expirationDate: currentUser.expirationDate
                    },
                    (err, response) => {
                        console.log('Mountpoint is: ', this.mountPoint);
                        if (err) console.log(err);
                        if(response.message) console.log(response.message);
                        if (response) return process.nextTick(cb, 0, response.filenames);
                        return process.nextTick(cb, 0);
                    });
            },

            // Called before the filesystem accessed a file.
            access: (path, mode, cb) => {
                this.stub.access({path: path, mode: mode},
                    (err, response) => {
                        // console.log('here', response);
                        if (err) console.log(err);
                        return process.nextTick(cb, 0);
                    });
            },

            // Called when a path is being stat'ed.
            getattr: (path, cb) => {
                this.stub.getattr({path: path},
                    (err, response) => {
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
                            process.nextTick(cb, this.ENOENT);
                        }
                    });
            },

            // Called when a path is being opened.
            open: async (path, flags, cb) => {
                const tempPromise = new Promise((resolve, reject) => {
                    this.stub.open({path: path, flags: flags}, (err, response) => {
                        if (err) console.log(err);
                        // console.log('open fd is: ', response.fd);
                        // console.log('response is: ', response);
                        resolve(response.fd);
                    })
                });

                await tempPromise.then(fd => {
                    process.nextTick(cb, 0, fd);
                });
            },

            // Called when contents of a file is being read.
            read: (path, fd, buf, len, pos, cb) => {
                const currentUser = this.getCurrentUser();

                this.stub.read({
                    path: path, fd: fd,
                    buf: buf, len: len, pos: pos,
                    mountpoint: this.mountPoint,
                    username: currentUser.username,
                    userType: currentUser.userType,
                    expirationDate: currentUser.expirationDate
                }, (err, response) => {
                    if(response.message) {
                        console.log(response.message);
                        process.nextTick(cb, 0);
                    } else {
                        console.log('Mountpoint is: ', this.mountPoint);
                        // if (err) console.log(err);
                        buf.set(response.buf);
                        process.nextTick(cb, buf.length);
                    }
                });
            },

            // Called when a directory is being opened.
            opendir: (path, flags, cb) => {
                this.stub.opendir({path: path, flags: flags}, (err, response) => {
                    process.nextTick(cb, 0);
                });
            },

            // Called when the filesystem is being stat'ed.
            statfs: (path, cb) => {
                this.stub.statfs({path: path}, (err, response) => {
                    process.nextTick(cb, 0, response.statfs);
                });
            },

            // Called when a new file is being opened.
            create: (path, mode, cb) => {
                this.stub.create({path: path, mode: mode}, (err, response) => {
                    process.nextTick(cb, 0);
                });
            },

            // Called when a file is being unlinked.
            unlink: (path, cb) => {
                this.stub.unlink({path: path}, (err, response) => {
                    process.nextTick(cb, 0);
                });
            },

            // Called when a new directory is being created.
            mkdir: (path, mode, cb) => {
                this.stub.mkdir({path: path, mode: mode}, (err, response) => {
                    process.nextTick(cb, 0);
                })
            },

            // Called when a directory is being removed.
            rmdir: (path, cb) => {
                this.stub.rmdir({path: path}, (err, response) => {
                    process.nextTick(cb, 0);
                })
            },

            // Called when the mode of a path is being changed.
            chmod: (path, mode, cb) => {
                this.stub.chmod({path: path, mode: mode}, (err, response) => {
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
    }
}

module.exports = Operations;