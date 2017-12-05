class LayerBuilder {
    constructor() {
        const deeplearn = require('deeplearn');
        this.graph = new deeplearn.Graph();
    }


    createFullyConnectedLayer(inputTensor, size, activationFunction, useBias = true) {
        return this.graph.layers.dense('fcl', inputTensor, size, activationFunction, useBias)
    }

    createReLULayer(inputTensor) {
        return this.graph.relu(inputTensor);
    }
}

module.exports = LayerBuilder;
