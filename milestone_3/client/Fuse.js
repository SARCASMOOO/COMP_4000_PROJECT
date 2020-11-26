const ops = require("./FileSystem").ops;

function mountFuse() {
    ops.setClient(client);
    const fuse = new Fuse('./fuse', ops, {force: false, displayFolder: true});
    fuse.mount(err => UI.mountFuse(err, fuse));
    process.once('SIGINT', () => fuse.unmount(err => UI.unMountFuse(err, fuse)));
}