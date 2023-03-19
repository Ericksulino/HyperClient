const { Gateway, Wallets } = require('fabric-network');
const path = require('path');

// Configurações de conexão com a rede
const ccpPath = path.resolve(__dirname, 'connection.json');
const walletPath = path.resolve(__dirname, 'wallet.json');
const userId = 'user1';

async function main() {
  try {
    // Carrega as configurações de conexão com a rede
    const ccp = await Gateway.connect(ccpPath, { wallet: Wallets.newInMemoryWallet() });

    // Obtém a carteira do usuário
    const wallet = Wallets.newInMemoryWallet();
    const userCert = fs.readFileSync(path.join(__dirname, 'User1@org1.example.com-cert.pem')).toString();
    const userKey = fs.readFileSync(path.join(__dirname, 'priv_sk')).toString();
    const identity = {
      credentials: {
        certificate: userCert,
        privateKey: userKey
      },
      mspId: 'Org1MSP',
      type: 'X.509'
    };
    await wallet.add(userId, identity);

    if (!identity) {
      console.log(`A identidade ${userId} não foi encontrada na carteira`);
      return;
    }

    // Cria um gateway e conecta à rede
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

    // Obtém a rede e o contrato inteligente (chaincode)
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('fabcar');

    // Cria uma proposta de transação
    const proposal = contract.createTransaction('createCar');
    proposal.setEndorsingPeers(['peer0.org1.example.com']);

    // Define os argumentos da transação
    const car = {
      make: 'Toyota',
      model: 'Prius',
      color: 'blue',
      owner: 'Tom',
    };
    proposal.setTransient({
      car: Buffer.from(JSON.stringify(car)),
    });

    // Endossa a proposta de transação
    const transaction = proposal.sign();
    const result = await transaction.evaluate();

    // Submete a transação para a rede
    const commit = await transaction.submit();
    const status = await commit.getStatus();

    console.log(`Transaction status: ${status}`);
    console.log(`Transaction result: ${result.toString()}`);

    // Fecha o gateway e desconecta da rede
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
}

main();
