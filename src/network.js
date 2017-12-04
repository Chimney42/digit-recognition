const deeplearn = require('deeplearn');
class Network {
    constructor() {
        this.graph = new deeplearn.Graph();
        this.layerCount = 0;
        this.lastLayer;
    }

    init(inputLength) {
        this.lastLayer = this.graph.placeholder('inputs', [inputLength])
    }

    addFullyConnectedLayer(size, activationFunction, useBias = true) {
        const newLayer = this.graph.layers.dense('fully_connected_' + this.layerCount, this.lastLayer, size, activationFunction, useBias);
        this.layerCount++;
        this.lastLayer = newLayer;
    }
}

module.exports = Network;
