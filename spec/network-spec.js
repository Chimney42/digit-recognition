const Network = require('../src/network');
describe('A Neural Network',() => {
    let network;
    beforeEach(() => {
        network = new Network();
    });
    it('should be constructed with a graph', () => {
        expect(network.graph).toBeDefined();
    });
});
