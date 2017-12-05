class LayerBuilder {
    constructor() {
        const deeplearn = require('deeplearn');
        this.graph = deeplearn;
    }


    createFullyConnectedLayer(inputTensor, size, activationFunction, useBias = true) {
        return this.graph.layers.dense('fcl', inputTensor, size, activationFunction, useBias)
    }

    createReLULayer() {
        this.lastLayer = this.graph.relu(this.lastLayer);
    }
}

module.exports = LayerBuilder;
