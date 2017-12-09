class LayerBuilder {
    constructor() {
        this.deeplearn = require('deeplearn');
        this.graph = new this.deeplearn.Graph();
    }

    createFullyConnectedLayer(inputTensor, size, activationFunction, index) {
        return this.graph.layers.dense('fcl-'+index, inputTensor, size, activationFunction, true)
    }

    createReLULayer(inputTensor) {
        return this.graph.relu(inputTensor);
    }

    createConvolutionalLayer(inputTensor, fieldSize, outputDepth, index) {
        const wShape = [fieldSize, fieldSize, inputTensor.shape[2], outputDepth];
        const w = this.deeplearn.Array4D.randTruncatedNormal(wShape, 0, 0.1);
        const b = this.deeplearn.Array1D.zeros([outputDepth]);

        const wTensor = this.graph.variable(`conv2d-${index}-w`, w);
        const bTensor = this.graph.variable(`conv2d-${index}-b`, b);
        return this.graph.conv2d(inputTensor, wTensor, bTensor, fieldSize, depth);
    }
}

module.exports = LayerBuilder;
