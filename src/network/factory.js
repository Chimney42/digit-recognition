const Network = require('./../network');
class NetworkFactory {
    newNetwork() {
        return new Network();
    }
    createNetwork(config) {
        const network = this.newNetwork();
        network.init(config.featureCount);
        config.layers.forEach(layerConfig => {
            network.addLayer(layerConfig)
        });
        network.addLayer({
            type: 'fully_connected',
            activation: 'sigmoid',
            size: config.labelCount
        });
        return network;
    }
}

module.exports = NetworkFactory;
