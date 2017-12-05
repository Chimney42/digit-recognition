const Network = require('./../network');
class NetworkFactory {
    newNetwork() {
        return new Network();
    }
    createNetwork(config) {
        const network = this.newNetwork();
        network.init(config.featureCount);
        const activationFunction = network.getActivationFunction(config.activationFunction);
        config.layers.forEach(layerConfig => {
            const addLayer = network.getLayerCreation(layerConfig.type);
            addLayer(layerConfig.size, activationFunction)
        });
        network.addFullyConnectedLayer(config.labelCount, activationFunction);
        return network;
    }
}

module.exports = NetworkFactory;
