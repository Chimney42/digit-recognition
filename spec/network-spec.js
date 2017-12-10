const deeplearnMock = require('deeplearn');
const Network = require('../src/network');
describe('A Neural Network',() => {
    let network;
    beforeEach(() => {
        spyOn(deeplearnMock, 'NDArrayMathGPU');

        network = new Network(deeplearnMock);
    });
    it('should be constructed with a graph', () => {
        expect(network.graph).toBeDefined();
    });

    it('should init network with input layer', () => {
        network.init();
        expect(network.lastLayer).toBeDefined();
    });

    it('should train network', () => {
        const labelCount = 10;
        const inputData = [{size: 5}];
        const targetData = [{size: labelCount}];
        const trainingData = {
            input: inputData,
            target: targetData
        };
        const validationData = {
            input: [],
            target: []
        };
        network.init(labelCount);
        network.startSession();
        network.startGraphRunner();
        const shuffleProvider = {
            getInputProviders: () => [{}, {}]
        };
        spyOn(network.deeplearn, 'InGPUMemoryShuffledInputProviderBuilder').and.returnValue(shuffleProvider);
        spyOn(network.graphRunner, 'train');
        network.train(trainingData, validationData, 6, 1, 0.0002);

        expect(network.deeplearn.InGPUMemoryShuffledInputProviderBuilder).toHaveBeenCalledWith([inputData, targetData]);
        expect(network.graphRunner.train).toHaveBeenCalled();
    });

    it('should make prediction', (done) => {
        const inputRow = {};
        const expLabel = 2;
        const data = [0, 0.9, 1, 0];
        const evalMock = {
            data: () => Promise.resolve(data)
        };
        network.startSession();
        spyOn(network.session, 'eval').and.returnValue(evalMock);
        network.predict(inputRow)
            .then(label => {
                expect(label).toBe(expLabel);
                done();
            })
    });
});
