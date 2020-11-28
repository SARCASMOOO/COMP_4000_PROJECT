// The Mount script will check if a user had permission to mount on a given folder.
// If the user has permission then
const Mount = (() => {
    const mountPoints = [];

    function addMountPoint(call, callback) {
        const {mountPoint} = call.request;

        console.log('Here');
        if(typeof mountPoint === "string") {
            mountPoints.push(mountPoint);
            console.log('Mount points are: ', mountPoints);
        }
        const reply = {status: 1, message: 'Mount point added.'};
        callback(null, reply);
    }

    return {addMountPoint: addMountPoint};
})();

module.exports = {
    Mount: Mount
};

