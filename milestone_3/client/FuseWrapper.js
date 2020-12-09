const Fuse = require('fuse-native');

class FuseWrapper {
    constructor(operations) {
        const options = {force: false, displayFolder: true};
        this.fuse = new Fuse('./fuse', operations, options);
    }

    mountFuse(stub, cb) {
        this.fuse.mount(err => {
            if (err) throw err
            console.log('filesystem mounted on ' + this.fuse.mnt);
            this.stub = stub;
            if(cb) cb(fuse);
        });

        process.once('SIGINT', () => this.unmountFuse(this.fuse));
    }

    unmountFuse(cb) {
        this.fuse.unmount(err => {
            const message = err ? `not unmounted', ${err}` : ' unmounted';
            console.log('filesystem at ' + this.fuse.mnt + message);
            if(cb) cb(this.fuse);
        })
    }
}

module.exports = FuseWrapper;