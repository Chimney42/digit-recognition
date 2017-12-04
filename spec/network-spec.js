const Network = require('../src/network');
describe('A Neural Network',() => {
    let network;
    beforeEach(() => {
        network = new Network();
    });
    it('should be constructed with a graph', () => {
        expect(network.graph).toBeDefined();
    });
    it('should add a fully connected layer to graph', () => {
        const lastLayer = network.graph.placeholder('inputs', [4]);
        network.lastLayer = lastLayer;
        const size = 8;
        const activationFunction = (x) => x;

        network.addFullyConnectedLayer(size, activationFunction);
        expect(network).not.toBe(lastLayer);
    });
});
