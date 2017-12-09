const LayerBuilder = require('../../src/network/layerBuilder');
describe('The layer builder', () => {
    const inputTensor = {};
    const size = 8;
    const activationFunction = (x) => x;
    let builder;
    beforeEach(() => {
        builder = new LayerBuilder();
        builder.graph = {
            layers : {
                dense: jasmine.createSpy('dense')
            },
            relu : jasmine.createSpy('relu')
        };
    });

    it('should add a fully connected layer to net', () => {
        const index = 3;
        builder.createFullyConnectedLayer(inputTensor, size, activationFunction, index);
        expect(builder.graph.layers.dense).toHaveBeenCalledWith('fcl-'+index, inputTensor, size, activationFunction, true);
    });

    it('should add a reLU layer to net', () => {
        builder.createReLULayer(inputTensor);
        expect(builder.graph.relu).toHaveBeenCalledWith(inputTensor);
    });
});