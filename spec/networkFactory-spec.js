const NetworkFactory = require('../src/networkFactory');

describe('The network factory', () => {
    it('should create a network from config object', () => {
        const factory = new NetworkFactory();
        const config = {
            featureCount: 5,
            hiddenLayerSizes: [2, 4],
            labelCount: 10,
            activationFunction : 'functionName'
        };
        const networkMock = {
            init: jasmine.createSpy('init'),
            getActivationFunction: jasmine.createSpy('getActivationFunction').and.returnValue(() => {}),
            addFullyConnectedLayer: jasmine.createSpy('addFullyConnectedLayer')
        };
        spyOn(factory, 'newNetwork').and.returnValue(networkMock);

        const network = factory.createNetwork(config);

        expect(network).toBe(networkMock);
        expect(network.init).toHaveBeenCalledWith(config.featureCount);
        expect(network.getActivationFunction).toHaveBeenCalledWith(config.activationFunction);
        expect(network.addFullyConnectedLayer.calls.allArgs()).toEqual([
            [2, jasmine.any(Function)],
            [4, jasmine.any(Function)],
            [config.labelCount, jasmine.any(Function)]
        ])
    })
});