const crypto = require('crypto');
const { connect, signers } = require('fabric-gateway');
const { readFileSync } = require('fs');
const { TextDecoder } = require('util');
const grpc = require('@grpc/grpc-js');

const utf8Decoder = new TextDecoder();

async function main() {
    const credentials = readFileSync('../peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem');
    const identity = { mspId: 'Org1MSP', credentials };

    const privateKeyPem = readFileSync('../peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk');
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const signer = signers.newPrivateKeySigner(privateKey);

    const client = new grpc.Client('gateway.example.org:1337', grpc.credentials.createInsecure());

    const gateway = await connect({ identity, signer, client });
    try {
        const network = gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');

        const putResult = await contract.submitTransaction('put', 'time', new Date().toISOString());
        console.log('Put result:', utf8Decoder.decode(putResult));

        const getResult = await contract.evaluateTransaction('get', 'time');
        console.log('Get result:', utf8Decoder.decode(getResult));
    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(console.error);
