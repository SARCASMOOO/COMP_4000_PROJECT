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

class Client {
    constructor(domain, port) {
        this.user = new User();
        this.curentUser = null;
        this.address = domain + port;
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
        if(this.operations) return this.operations;
        console.log('Stub is 2, ', stub);
        this.operations = new Operations(stub);
        return this.operations.getOps();
    }

    main() {
        const credentials = this.getCredentials();
        const proto = this.getProto();
        const stub = this.getStub(credentials, proto);
        // const operations = this.getOperations(stub);
        // this.fuseWrapper = new fuseWrapper(operations);
        // this.fuseWrapper.mountFuse(stub);

    }
}

const client =  new Client('localhost', ':10001');
client.main();




