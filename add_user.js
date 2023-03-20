const { Wallets} = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main() {
    const wallet = await Wallets.newFileSystemWallet('wallet');

    const cert = fs.readFileSync('../caliper-workspace/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem').toString();
    const key = fs.readFileSync('../caliper-workspace/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk').toString();

    const identityLabel = 'Admin@org1.example.com';
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