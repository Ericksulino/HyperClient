const { Wallets, X509Identity } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

const caURL = '"https://ca.org1.example.com:7054"';
const caName = 'ca.org1.example.com';
const walletPath = './wallet';

async function enrollUser(userId, userSecret) {
  // Cria uma instância do serviço Fabric CA
  const caService = new FabricCAServices(caURL, { caName });

  // Cria uma carteira
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // Verifica se a carteira já possui a identidade do usuário
  const identity = await wallet.get(userId);
  if (identity) {
    console.log(`A identidade ${userId} já existe na carteira`);
    return;
  }

  // Enroll do usuário
  const enrollment = await caService.enroll({
    enrollmentID: userId,
    enrollmentSecret: userSecret,
  });

  // Cria uma identidade de usuário
  const identityX509 = X509Identity.createWithCert({
    certificate: enrollment.certificate,
    privateKey: enrollment.key.toBytes(),
  });

  // Adiciona a identidade à carteira
  await wallet.put(userId, identityX509);

  console.log(`A identidade ${userId} foi adicionada à carteira`);
}

enrollUser('user1', 'password');
