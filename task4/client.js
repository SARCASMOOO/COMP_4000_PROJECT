const PROTO_PATH = __dirname + '/helloworld.proto';

// Modules
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

// Config
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function getUserCredentials() {
  const messages = [
      'Welcome to my COMP 4000 Project, Milestone 1. \n Please enter your username.',
      'Please enter your password: ',
      'Confirm Password: '
    ];	
  
  const console_prompt = readlineSync.question(messages[0]);
  messages.forEach((message) => {
	  console.log(message);
  });
}

function main() {
  const PORT = ':10000';
  const DOMAIN = 'localhost'
  const ADDRESS = DOMAIN + PORT;

  const client = new hello_proto.Greeter(ADDRESS, grpc.credentials.createInsecure());

  const msg1 = 'Hello ';
  const msg2 = 'World';

  getUerCredentials();

	  //  client.sayHello({message_1: msg1, message_2: msg2}, function(err, response) {
  //  console.log('Greeting:', response.message_3);
  ..});
}

main();
