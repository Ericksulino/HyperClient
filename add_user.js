const { Wallets} = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main() {
    const wallet = await Wallets.newFileSystemWallet('wallet');

    const cert = fs.readFileSync('../peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem').toString();
    const key = fs.readFileSync('../peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk').toString();

    const identityLabel = 'User1@org1.example.com';
    const identity = {
        credentials: {
            certificate: cert,
            privateKey: key,
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };

    await wallet.put(identityLabel, identity);
}

main();