// Paths
const PROTO_PATH = __dirname + '/../helloworld.proto';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

// Helper Classes
const fuseWrapper = require('./FuseWrapper');
const User = require('./User');
const Operations = require('./Operations');
const UpdateLoop = require('./Update');

class Client {
    constructor(domain, port) {
        this.curentUser = null;
        this.address = domain + port;
    }

    getCurrentUser() {
        return this.updateLoop.curentUser
    }

    // https://github.com/gbahamondezc/node-grpc-ssl/blob/master/
    getCredentials() {
        return grpc.credentials.createSsl(
            fs.readFileSync('../certs/ca.crt'),
            fs.readFileSync('../certs/client.key'),
            fs.readFileSync('../certs/client.crt')
        );
    }

    getProto() {
        const packageDefinition = protoLoader.loadSync(
            PROTO_PATH,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });

        return grpc.loadPackageDefinition(packageDefinition).helloworld;
    }

    getStub(credentials, proto) {
        const stub = new proto.Greeter(this.address, credentials);
        this.stub = stub;
        return stub;
    }

    getOperations(stub) {
        if(this.operations) return this.operations.getOps();
        console.log('Stub is 2, ', stub);
        this.operations = new Operations(stub, this.getCurrentUser);
        return this.operations.getOps();
    }

    main() {
        const credentials = this.getCredentials();
        const proto = this.getProto();
        const stub = this.getStub(credentials, proto);
        const operations = this.getOperations(stub);
        this.fuseWrapper = new fuseWrapper(operations);
        this.user = new User(this.operations);
        this.fuseWrapper.mountFuse(stub);
        this.updateLoop = new UpdateLoop(this.user, this.fuseWrapper);
        const currentUser = this.user.curentUser;
        this.updateLoop.update(stub, currentUser).then();
    }
}

const client =  new Client('localhost', ':10001');
client.main();




