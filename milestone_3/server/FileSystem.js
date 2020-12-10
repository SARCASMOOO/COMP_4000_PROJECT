const fs = require('fs');
const Fuse = require('fuse-native');
const root_file_path = '/Users/main/Coding/school/COMP_4000/milestone_3/server/real';
let acl;

// TODO: Add ACL and expiration time check for readir and read.
const setACL = tempAcl => acl = tempAcl;

const ops = {
    readdir: function (call, callback) {
        // const isExpired = isTokenExpired(call.request.expirationDate);
        // if(isExpired) callback(null, {filenames: [], message: 'User is expired.'});
        // TODO: Need to consult ACL for which filenames to return.

        console.log('Username is: ', call.request.username);
        console.log('read mountpoint is: ', call.request.mountpoint);
        const mountpoint = call.request.mountpoint;
        let filenames = fs.readdirSync(root_file_path + mountpoint + call.request.path);

        console.log('server readdir before filter');
        console.log('filenames is: ', filenames);
        filenames = filenames.filter(filename => acl.isAccess(
            {
                path: root_file_path + mountpoint + filename,
                permissions: 'r'
            },
            call.request.userType,
            call.request.username
            )
        );

        console.log('server readdir after filter');
        console.log('filenames is: ', filenames);
        callback(null, {filenames: filenames});
    },

    access: function (call, callback) {
        fs.accessSync(root_file_path + call.request.mountpoint + call.request.path);
        callback(null, {response: 0});
    },

    getattr: function (call, callback) {
        try {
            const stats = fs.statSync(root_file_path + call.request.mountpoint + call.request.path);
            callback(null, {tempStat: stats});
        } catch (e) {
            console.log('error', e);
            callback(null, {response: Fuse.ENOENT});
        }
    },

    open: function (call, callback) {
        console.log('open');
        const fd = fs.openSync(root_file_path + call.request.mountpoint + call.request.path, call.request.flags);
        callback(null, {fd: fd});
    },

    read: function (call, callback) {
        const isExpired = isTokenExpired(call.request.expirationDate);
        if(isExpired) callback(null, {message: 'User is expired.'});

        console.log('Username is: ', call.request.username);
        console.log('read mountpoint is: ', call.request.mountpoint);
        const {path, fd, len, pos, buf, username} = call.request;
        console.log('read(%s, %d, %d, %d)', path, fd, len, pos);
        const requestedRule = {path: path, permissions: 'r'};
        // const result = acl.isAccess(requestedRule, call.request.userType, username);
        const result = true;

        if(result) {
            const size = fs.readSync(fd, buf, 0, len, pos);
            console.log('buf: ', buf, ', size: ', size);
            if (!size) callback(null, 0);
            callback(null, {size: size, buf: buf});
        } else {
            callback(null, 0);
        }
    },

    opendir: function (call, callback) {
        const dir = fs.opendirSync(root_file_path + call.request.mountpoint + call.request.path);
        console.log('dir is: ', dir);
        callback(null, {});
    },

    statfs: function (call, callback) {
        const statfs = fs.statSync(root_file_path + call.request.mountpoint + call.request.path);
        callback(null, {stat: statfs});
    },

    create: function (call, callback) {
        fs.writeFileSync(root_file_path + call.request.mountpoint + call.request.path, '', {mode: call.request.mode});
        callback(null, {});
    },

    unlink: function (call, callback) {
        fs.unlinkSync(root_file_path + call.request.mountpoint + call.request.path);
        callback(null, {});
    },

    mkdir: function (call, callback) {
        fs.mkdirSync(root_file_path + call.request.mountpoint + call.request.path, {mode: call.request.mode});
        callback(null, {});
    },

    rmdir: function (call, callback) {
        fs.rmdirSync(root_file_path + call.request.mountpoint + call.request.path);
        callback(null, {});
    },

    chmod: function (call, callback) {
        fs.chmodSync(root_file_path + call.request.mountpoint + call.request.path, call.request.mode);
        callback(null, {});
    }
}

function isTokenExpired(startTime) {
    const timeToLive = 2000000;
    const endTime = new Date().getTime();
    // return (endTime - startTime > timeToLive);
    // NOTE: This is for testing purposes.
    return false;
}


module.exports = {
    setACL: setACL,
    readdir: ops.readdir,
    access: ops.access,
    getattr: ops.getattr,
    open: ops.open,
    read: ops.read,
    opendir: ops.opendir,
    statfs: ops.statfs,
    create: ops.create,
    unlink: ops.unlink,
    mkdir: ops.mkdir,
    rmdir: ops.rmdir,
    chmod: ops.chmod
};