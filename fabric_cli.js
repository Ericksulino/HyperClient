const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Configurações de conexão com a rede
const ccpPath = path.resolve(__dirname, 'connection.json');
const walletPath = path.resolve(__dirname, 'wallet');
const userId = 'User1@org1.example.com';

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

    try {
      // Conecta à rede
      await gateway.connect(ccp, {
        wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: false },
      });

      console.log('Conexão estabelecida com sucesso à rede Hyperledger Fabric');

    } catch (error) {
      console.error('Falha ao estabelecer conexão com a rede Hyperledger Fabric:', error);
    }
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

     // Assina e endossa a proposta de transação
     const transaction = proposal.sign();
     const endorsement = await transaction.endorse();

    // Verifica se todos os endorsements foram bem sucedidos
    if (endorsement.every(({ response }) => response.status === 200)) {
        // Submete a transação para a rede
        const commit = await transaction.submit();
        const status = await commit.getStatus();
        console.log(`Transaction status: ${status}`);
    } else {
        console.log('A transação foi rejeitada pelos endorsers.');
    }


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
