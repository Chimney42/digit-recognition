class Network {
    constructor() {
        this.deeplearn = require('deeplearn');
        this.graph = new this.deeplearn.Graph();
        this.layerCount = 0;
    }

    init(inputLength) {
        this.inputTensor = this.graph.placeholder('inputs', [inputLength]);
        this.lastLayer = this.inputTensor;
    }

    getLayerCreation(type) {
        let fn;
        switch(type) {
            case 'fully_connected':
                fn = this.addFullyConnectedLayer.bind(this);
                break;
        }

        return fn;
    }

    addFullyConnectedLayer(size, activationFunction, useBias = true) {
        const newLayer = this.graph.layers.dense('fully_connected_' + this.layerCount, this.lastLayer, size, activationFunction, useBias);
        this.layerCount++;
        this.lastLayer = newLayer;
    }

    startSession() {
        this.session = new this.deeplearn.Session(this.graph, new this.deeplearn.NDArrayMathCPU());
    }

    endSession() {
        this.session.dispose();
    }

    getActivationFunction(functionName) {
        let fn;
        switch(functionName) {
            case 'sigmoid':
                fn = this.graph.sigmoid.bind(this.graph);
                break;
        }
        return fn;
    }

    train(inputData, targetData, batchSize, batchCount, learningRate) {
        const targetTensor = this.graph.placeholder('target', [targetData[0].size]);
        const costTensor = this.graph.softmaxCrossEntropyCost(this.lastLayer, targetTensor);
        this.accuracyTensor = this.graph.argmaxEquals(this.lastLayer, targetTensor);

        const shuffledInputProviderBuilder = new this.deeplearn.InCPUMemoryShuffledInputProviderBuilder([inputData, targetData]);
        const [inputProvider, targetProvider] = shuffledInputProviderBuilder.getInputProviders();

        const feedEntries = [
            {tensor: this.inputTensor, data: inputProvider},
            {tensor: targetTensor, data: targetProvider}
        ];

        if (!this.session) this.startSession();

        console.log('start training');

        for (let i = 0; i < batchCount; i++) {
            const optimizer = new this.deeplearn.MomentumOptimizer(learningRate, 0.1);
            this.session.train(costTensor, feedEntries, batchSize, optimizer, this.deeplearn.CostReduction.MEAN);

            if (i % 10 == 0) {
                console.log(`training iteration ${i} of ${batchCount}`);
            }
        }
    }

    predict(inputRow) {
        const testFeedEntries = [{tensor: this.inputTensor, data: inputRow}];
        return new Promise((resolve, reject) => {
            this.session.eval(this.lastLayer, testFeedEntries)
                .data()
                .then(data => {
                    const label = data.indexOf(data.reduce(( acc, cur ) => Math.max( acc, cur )));
                    resolve(label);
                })
        });
    }
}

module.exports = Network;
