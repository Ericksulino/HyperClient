from hfc.fabric import Client

# Crie uma instância do cliente
client = Client(net_profile="../caliper-workspace/networks/networkConfig.yaml")

# Conecte-se à rede
client.init()

# Consulta todos os carros
response = client.query_chaincode(
    channel_name="mychannel",
    chaincode_name="fabcar",
    fcn="queryAllCars",
    args=[]
)

# Imprime o resultado
print(response)

# Adiciona um novo carro
response = client.invoke_chaincode(
    channel_name="mychannel",
    chaincode_name="fabcar",
    fcn="createCar",
    args=["CAR10", "Chevy", "Volt", "Red", "Nick"],
    cc_pattern=None,
    transient_map=None,
    proposal_wait_time=10000,
    endorser=None,
    retry=None
)

# Imprime o resultado
print(response)
