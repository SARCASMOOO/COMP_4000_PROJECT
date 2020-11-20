const fs = require('fs');
const Fuse = require('fuse-native');

const root_file_path = '/Users/main/Coding/school/COMP_4000/milestone_2/client/real';

const ops = {
    readdir: function (call, callback) {
        console.log('readdir');
        console.log('path', call.request.path);
        const filenames = fs.readdirSync(root_file_path + call.request.path);
        console.log(root_file_path + call.request.path);
        console.log('filenames', filenames);
        callback(null, {filenames: filenames});
    },
    access: function (call, callback) {
        console.log('access');
        console.log('access', call.request.path, call.request.mode);
        callback(null, {response: 0});
    },
    getattr: function (call, callback) {
        console.log('getattr');
        console.log('getattr', call.request.path);

        try {
            const tempStat = fs.statSync(root_file_path + call.request.path);
            console.log('tempstat', tempStat);
            callback(null, {tempStat: tempStat});
        } catch (e) {
            console.log(e);
            callback(null, {response: Fuse.ENOENT});
        }
    },
    open: function (call, callback) {
        console.log('open');
        console.log('open', root_file_path + call.request.path, 'flags', call.request.flags);
        const fd = fs.openSync(root_file_path + call.request.path , call.request.flags);
        callback(null, {fd: fd});
    },
    read: function (call, callback) {
        console.log('read22');
        console.log(
            'path', call.request.path,
            'fd', call.request.fd,
            'buf', call.request.buf,
            'len', call.request.len,
            'pos', call.request.pos);

        const size = fs.readSync(
            call.request.fd, call.request.buf, 0,
            call.request.len, call.request.pos);

        console.log('new buffer', call.request.buf);
        console.log('Size555555', size);
        callback(null, {size: size, buf: call.request.buf});
    },
    opendir: function (call, callback) {
        console.log('opendir');
        console.log(
            'path', call.request.path,
            'flags', call.request.flags);
        const res = fs.opendirSync(root_file_path + call.request.path);
        callback(null, {});
    },
    statfs: function (call, callback) {
        console.log('statfs');
        console.log('path', call.request.path);
        const tempStat = fs.statSync('./real' + call.request.path);
        // console.log('hello445566', tempStat);
        callback(null, {stat: tempStat});
    },
    create: function (call, callback) {
        console.log('create');
        console.log(
            'path', call.request.path,
            'mode', call.request.mode);
        fs.writeFileSync('./real' + call.request.path, '', {mode: call.request.mode});
        callback(null, {});
    },
    write: function (call, callback) {
        console.log('write');
        console.log(
            'path', call.request.path,
            'path', call.request.path,
            'fd', call.request.fd,
            'buffer', call.request.buffer,
            'length', call.request.length,
            'position', call.request.position);
        try {
            // TODO: Unable to write. File is read only.
            console.log('Write was called');
            fs.write(call.request.fd, call.request.buffer, 0,
                call.request.length, call.request.position,
                function (e) {
                    console.log(e);
                });
        } catch (e) {
            console.log(e);
        }
        callback(null, {});
    },
    unlink: function (call, callback) {
        console.log('unlink');
        console.log('path', call.request.path);
        console.log('unlink');
        fs.unlinkSync(root_file_path + call.request.path);
        callback(null, {});
    },
    mkdir: function (call, callback) {
        console.log('mkdir');
        console.log(
            'path', call.request.path,
            'mode', call.request.mode);
        fs.mkdirSync(root_file_path + call.request.path, {mode: call.request.mode});
        callback(null, {});
    },
    rmdir: function (call, callback) {
        console.log('rmdir');
        console.log('path', call.request.path);
        fs.rmdirSync(root_file_path + call.request.path);
        callback(null, {});
    },
    chmod: function (call, callback) {
        console.log('Response from chmod');
        console.log(
            'path', call.request.path,
            'mode', call.request.mode);
        fs.chmodSync(root_file_path + call.request.path, call.request.mode);
        callback(null, {});
    }
}

module.exports = {
    readdir: ops.readdir,
    access: ops.access,
    getattr: ops.getattr,
    open: ops.open,
    read: ops.read,
    opendir: ops.opendir,
    statfs: ops.statfs,
    create: ops.create,
    write: ops.write,
    unlink: ops.unlink,
    mkdir: ops.mkdir,
    rmdir: ops.rmdir,
    chmod: ops.chmod
};