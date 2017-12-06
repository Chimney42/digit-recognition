const LayerBuilder = require('./network/layerBuilder');
class Network {
    constructor() {
        this.deeplearn = require('deeplearn');
        this.graph = new this.deeplearn.Graph();
        this.math = new this.deeplearn.NDArrayMathCPU();
        this.layerBuilder = new LayerBuilder();
    }

    init(inputLength) {
        this.inputTensor = this.graph.placeholder('inputs', [inputLength]);
        this.lastLayer = this.inputTensor;
    }

    addLayer(config) {
        switch (config.type) {
            case 'fully_connected':
                this.lastLayer = this.layerBuilder.createFullyConnectedLayer(this.lastLayer, config.size, this.getActivationFunction(config.activation));
                break;
            case 'reLU':
                this.lastLayer = this.layerBuilder.createReLULayer(this.lastLayer);
                break;
        }
    }

    startSession() {
        this.session = new this.deeplearn.Session(this.graph, this.math);
    }

    endSession() {
        this.session.dispose();
        delete this.session;
    }

    getActivationFunction(functionName) {
        let fn;
        switch(functionName) {
            case 'sigmoid':
                fn = this.graph.sigmoid.bind(this.graph);
                break;
            case 'softmax':
                fn = this.graph.softmax.bind(this.graph);
                break;
        }
        return fn;
    }

    train(inputData, targetData, batchSize, batchCount, learningRate) {
        const targetTensor = this.graph.placeholder('target', [targetData[0].size]);
        const costTensor = this.graph.meanSquaredCost(this.lastLayer, targetTensor);
        const accuracyTensor = this.graph.argmaxEquals(this.lastLayer, targetTensor);

        const shuffledInputProviderBuilder = new this.deeplearn.InCPUMemoryShuffledInputProviderBuilder([inputData, targetData]);
        const [inputProvider, targetProvider] = shuffledInputProviderBuilder.getInputProviders();

        const trainFeeds = [
            {tensor: this.inputTensor, data: inputProvider},
            {tensor: targetTensor, data: targetProvider}
        ];

        if (!this.session) this.startSession();

        console.log('start training');

        for (let i = 0; i < batchCount; i++) {
            const optimizer = new this.deeplearn.MomentumOptimizer(learningRate, 0.1);
            this.session.train(costTensor, trainFeeds, batchSize, optimizer, this.deeplearn.MetricReduction.MEAN);

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
