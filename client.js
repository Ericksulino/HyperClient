const { Gateway, Wallets} = require('fabric-network');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

//const functions = ["InitLedger","createCar","queryAllCars","queryCar"];

const functions = ["InitLedger","createCar","GetAllAssets","ReadAsset"];

// Função para gerar um hash aleatório
const generateRandomHash = () => {
  const timestamp = new Date().getTime().toString();
  const randomString = Math.random().toString();
  const hash = crypto.createHash('sha256').update(timestamp + randomString).digest('hex');
  const truncatedHash = hash.substring(0, 5); // Extrai os primeiros 5 caracteres do hash
  return truncatedHash;
};

const initLedger = async (contract) => {
  try {
  
    await contract.submitTransaction(functions[0]);

    console.log('Função "'+functions[0]+'":'+hash+' executada com sucesso.');

    process.exit(0); // Encerrando o processo após a exibição da mensagem de sucesso
  } catch (error) {
    console.error(`Erro ao enviar a transação: ${error}`);
    process.exit(1);
  }
}


const submitTransactionEndorse = async (contract) => {
  try {
    let hash = generateRandomHash();
    const transaction = contract.createTransaction(functions[1]);
    const args = [`${hash}`, 'Toyota', 'Supra', 'Orange', 'Brian'];

    const evaluationResult = await transaction.evaluate(...args);
    if (evaluationResult) {
      console.log('Transação "'+functions[1]+'" avaliada com sucesso.');
    } else {
      throw new Error('Resposta da avaliação não disponível');
    }

    //transaction.setEndorsingPeers(['peer0.org1.example.com', 'peer1.org1.example.com']);

    await transaction.submit(...args);
    console.log('Transação "'+functions[1]+'" "'+hash+'"submetida com sucesso.');

    process.exit(0); // Encerrando o processo após a exibição da mensagem de sucesso
  } catch (error) {
    console.error(`Erro ao executar a transação: ${error}`);
    throw error;
  }
};

const submitTransactionSimple = async (contract) => {
  try {
    let hash = generateRandomHash();
    // Enviando a transação "createCar"
    await contract.submitTransaction(functions[1], `${hash}`, 'Toyota', 'Supra', 'Orange', 'Brian');

    console.log('Transação "'+functions[1]+'":'+hash+' enviada com sucesso.');

    process.exit(0); // Encerrando o processo após a exibição da mensagem de sucesso
  } catch (error) {
    console.error(`Erro ao enviar a transação: ${error}`);
    process.exit(1);
  }
};


const submitTransactionMultiple = async (contract, n) => {
  try {
    
    if (!n) {
      n = 1; // Define o valor padrão de n como 1 quando não há argumento
    }

    for (let i = 0; i < n; i++) {
      let hash = generateRandomHash();
      // Enviando a transação "createCar"
      await contract.submitTransaction(functions[1], `${hash}`, 'Nissan', 'Skyline', 'Silver', 'Brian');
      console.log(`${i + 1} Transação "'${functions[1]}" :${hash} enviada com sucesso.`);
    }

    console.log(`Total de ${n} transações "createCar" enviadas com sucesso.`);

    process.exit(0); // Encerrando o processo após a exibição da mensagem de sucesso
  } catch (error) {
    console.error(`Erro ao enviar a transação: ${error}`);
    process.exit(1);
  }
};


const queryAll = async (contract) => {
  try {
    // Enviando a transação "queryAllCars"
    const responseBuffer = await contract.evaluateTransaction(functions[2]);
    const response = responseBuffer.toString('utf8');

    // Verificando se a resposta está vazia
    if (response) {
      console.log('Consulta "'+functions[1]+'" executada com sucesso.');

      // Pasando a resposta como JSON
      const cars = JSON.parse(response);

      // Exibindo os dados dos carros
      console.log('Lista de carros:');
      cars.forEach((car) => {
        console.log(' -', car);
      });
    } else {
      console.log('Nenhum resultado retornado pela consulta.');
    }

    process.exit(0); // Encerrando o processo após a exibição da resposta
  } catch (error) {
    console.error(`Erro ao executar a consulta: ${error}`);
    process.exit(1);
  }
}

const queryByKey = async (contract, key) => {
  try {
    const responseBuffer = await contract.evaluateTransaction(functions[3], key);
    const response = responseBuffer.toString('utf8');

    if (response) {
      console.log(`Asset com chave ${key} encontrado:`);
      console.log(response);
      return response;
    } else {
      console.log(`Nenhum asset encontrado com a chave ${key}.`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao executar a consulta: ${error}`);
    throw error;
  }
};


const main = async () =>{
  try {
    // Configurações de conexão com a rede
    const ccpPath = path.resolve(__dirname, 'connection.json');
    const walletPath = path.resolve(__dirname, 'wallet');
    const userId = 'User1@org1.example.com';

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
      identity: userId,
      discovery: { enabled: true, asLocalhost: true},
    });


    console.log('Conexão estabelecida com sucesso à rede Hyperledger Fabric');

    // Obtém a rede e o contrato inteligente (chaincode)
    const network = await gateway.getNetwork('mychannel');
    //const contract = network.getContract('fabcar');
    const contract = network.getContract('basic');


    const argument = process.argv[2];

    switch (argument) {
      case "initLedger":
        initLedger(contract);
        break;
      case "endorseTransaction":
        submitTransactionEndorse(contract);
        break;
      case "submitTransaction":
        submitTransactionSimple(contract);
        break;
      case "submitTransactionMultiple":
        const n = parseInt(process.argv[3]);
        await submitTransactionMultiple(contract, n);
        break;
      case "queryAll":
        queryAll(contract);
        break;
      case "queryCarByKey":
          const key = process.argv[3];
          await queryByKey(contract, key);
          break;
      default:
        console.log("Argumento Inválido!: "+argument);
    }
    


    // Fecha o gateway e desconecta da rede
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
}

main();
