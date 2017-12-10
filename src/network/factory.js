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
            type: config.predictionLayer.type,
            activation: config.predictionLayer.activation,
            size: config.predictionLayer.size
        });
        return network;
    }
}

module.exports = NetworkFactory;
