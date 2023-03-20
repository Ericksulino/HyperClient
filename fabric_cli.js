const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Configurações de conexão com a rede
const ccpPath = path.resolve(__dirname, 'connection.json');
const walletPath = path.resolve(__dirname, 'wallet');
const userId = 'Admin@org1.example.com';

async function main() {
  try {
    // Cria uma instância da classe Gateway
    const gateway = new Gateway();

    // Carrega as configurações de conexão com a rede
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Carrega a carteira
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Verifica se a carteira possui a identidade do usuário
    const identity = await wallet.get(userId);

    if (!identity) {
      console.log(`A identidade ${userId} não foi encontrada na carteira`);
      return;
    }

    // Configura as credenciais do usuário
    const certificate = identity.credentials.certificate;
    const privateKey = identity.credentials.privateKey;

    // Conecta à rede
    await gateway.connect(ccp, {
      wallet,
      clientTlsIdentity: userId,
      discovery: { enabled: true, asLocalhost: false },
      identity: { credentials: { certificate, privateKey }, mspId: 'Org1MSP' }
    });

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
