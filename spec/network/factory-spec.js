const NetworkFactory = require('../../src/network/factory');

describe('The network factory', () => {
    it('should create a network from config object', () => {
        const factory = new NetworkFactory();
        const config = {
            featureCount: 5,
            layers: [{
                    type: 'fully_connected',
                    activation : 'functionName',
                    size: 5
                }],
            predictionLayer: {
                type: 'some type',
                activation : 'anotherFunction',
                size: 10
            }
        };
        const networkMock = {
            init: jasmine.createSpy('init'),
            getActivationFunction: jasmine.createSpy('getActivationFunction').and.returnValue(() => {}),
            addLayer: jasmine.createSpy('addLayer')
        };
        spyOn(factory, 'newNetwork').and.returnValue(networkMock);

        const network = factory.createNetwork(config);

        expect(network).toBe(networkMock);
        expect(network.init).toHaveBeenCalledWith(config.featureCount);
        expect(network.addLayer.calls.allArgs()).toEqual([
            [config.layers[0]],
            [{
                type: config.predictionLayer.type,
                activation: config.predictionLayer.activation,
                size: config.predictionLayer.size
            }]
        ])
    })
});