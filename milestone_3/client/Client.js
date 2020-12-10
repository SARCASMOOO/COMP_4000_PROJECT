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
        this.address = domain + port;
        const credentials = this.getCredentials();
        const proto = this.getProto();
        this.stub = this.getStub(credentials, proto);
        const operations = this.getOperations(this.stub);

        this.fuseWrapper = new fuseWrapper(operations);
        this.user = new User(this.operations);
        this.fuseWrapper.mountFuse(this.stub);
        this.updateLoop = new UpdateLoop(this.user, this.fuseWrapper);
    }

    getCurrentUser = () => {
        return this.user.curentUser;
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
        this.operations = new Operations(stub, this.getCurrentUser);
        return this.operations.getOps();
    }

    main() {
        const currentUser = this.user.curentUser;
        this.updateLoop.update(this.stub, currentUser).then();
    }
}

const client =  new Client('localhost', ':10001');
client.main();




