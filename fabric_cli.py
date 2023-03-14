from snakeskin.config import BlockchainConfig

# Or load from a static file
blockchain = BlockchainConfig.from_file('./config.yaml')

# obter o gateway a partir da configuração da rede blockchain
gateway = blockchain.get_gateway('my-gateway')


# Definir uma função assíncrona para invocar transações
async def invoke(gateway, fcn, args):
    try:
        # Invocar a transação usando o gateway fornecido
        transaction = await gateway.invoke(fcn=fcn, args=args)
        return transaction
    except Exception as e:
        # Lidar com exceções e possíveis erros de conexão
        print(f"Erro ao invocar transação: {e}")
        return None

async def query(gateway, fcn, args):
    try:
        # invocar a função 'queryCar' do fabcar para obter informações sobre um carro específico
        transaction = await gateway.query(fcn=fcn, args=args)
    except Exception as e:
        # Lidar com exceções e possíveis erros de conexão
        print(f"Erro ao invocar transação: {e}")
        return None


invoke(gateway, 'createCar', ['CAR10', 'Honda', 'Accord', 'Black', 'Tom'])

query(gateway, fcn='queryCar',args=['CAR10'])

# invocar a função 'queryAllCars' do fabcar para obter informações sobre todos os carros na rede
query(gateway, fcn='queryAllCars',args=[])
