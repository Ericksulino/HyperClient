const { Wallets, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const walletPath = path.resolve(__dirname, 'wallet');
const userId = 'user1';
const certificatePath = path.resolve(__dirname, '../caliper-workspace/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem');
const privateKeyPath = path.resolve(__dirname, '../caliper-workspace/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk');

async function main() {
  try {
    // Carrega a carteira
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Verifica se a carteira já possui a identidade do usuário
    const identity = await wallet.get(userId);
    if (identity) {
      console.log(`A identidade ${userId} já existe na carteira`);
      return;
    }

    // Obtém as credenciais do usuário
    const certificate = fs.readFileSync(certificatePath).toString();
    const privateKey = fs.readFileSync(privateKeyPath).toString();

    // Cria uma nova identidade de carteira
    const identityLabel = `${userId}@org1.example.com`;
    const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey);
    await wallet.put(identityLabel, mixin);

    console.log(`A identidade ${identityLabel} foi adicionada à carteira`);
  } catch (error) {
    console.error(`Falha ao adicionar a identidade à carteira: ${error}`);
    process.exit(1);
  }
}

main();
