const { Gateway, Wallets} = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Configurações de conexão com a rede
const ccpPath = path.resolve(__dirname, 'connection.json');
const walletPath = path.resolve(__dirname, 'wallet');
const userId = 'User1';
const userCredPath = path.resolve(__dirname, 'user1.json');

async function main() {
  try {
    // Cria uma instância da classe Gateway
    const gateway = new Gateway();

    // Carrega as configurações de conexão com a rede
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Obtém as credenciais do usuário
    const userCreds = JSON.parse(fs.readFileSync(userCredPath, 'utf8'));

   // Carrega a carteira
   const wallet = await Wallets.newFileSystemWallet(walletPath);

   // Verifica se a carteira possui a identidade do usuário
   const identity = await wallet.get(userId);

    //console.log(wallet);

    if (!identity) {
      console.log(`A identidade ${userId} não foi encontrada na carteira`);
      return;
    }

    // Configura as credenciais do usuário
    const privateKeyPath = userCreds.credentials[userId].privateKey.path;
    const privateKey = fs.readFileSync(privateKeyPath).toString();
    const certificatePath = userCreds.credentials[userId].certificate.path;
    const certificate = fs.readFileSync(certificatePath).toString();

     // Conecta à rede
     await gateway.connect(ccp, {
      wallet,
      clientTlsIdentity: userId,
      discovery: { enabled: true, asLocalhost: true },
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
