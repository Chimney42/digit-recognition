const LayerBuilder = require('../../src/network/layerBuilder');
describe('The layer builder', () => {
    it('should add a fully connected layer to graph', () => {
        const builder = new LayerBuilder();
        builder.graph = {
            layers : {
                dense: jasmine.createSpy('dense')
            }
        };
        const inputTensor = {};
        const size = 8;
        const activationFunction = (x) => x;

        builder.createFullyConnectedLayer(inputTensor, size, activationFunction);
        expect(builder.graph.layers.dense).toHaveBeenCalledWith('fcl', inputTensor, size, activationFunction, true);
    });
});