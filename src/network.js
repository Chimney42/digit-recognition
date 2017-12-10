const LayerBuilder = require('./network/layerBuilder');
class Network {
    constructor(deeplearnMock) {
        this.deeplearn = deeplearnMock || require('deeplearn');
        this.graph = new this.deeplearn.Graph();
        this.math = new this.deeplearn.NDArrayMathGPU();
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

    startGraphRunner(costCallback, metricCallback) {
        const eventObserver = {
            avgCostCallback: (avgCost) => costCallback(avgCost),
            metricCallback: (metric) => metricCallback(metric),
        };
        if (!this.session) this.startSession();
        this.graphRunner = new this.deeplearn.GraphRunner(this.math, this.session, eventObserver);
    }

    train(trainingData, validationData, batchSize, batchCount, learningRate, costCallback, metricCallback) {
        const targetTensor = this.graph.placeholder('target', [trainingData.target[0].size]);
        const costTensor = this.graph.meanSquaredCost(this.lastLayer, targetTensor);
        const accuracyTensor = this.graph.argmaxEquals(this.lastLayer, targetTensor);

        const shuffledInputProviderBuilder =
            new this.deeplearn.InGPUMemoryShuffledInputProviderBuilder([trainingData.input, trainingData.target]);
        const [inputProvider, targetProvider] = shuffledInputProviderBuilder.getInputProviders();
        const trainFeeds = [
            {tensor: this.inputTensor, data: inputProvider},
            {tensor: targetTensor, data: targetProvider}
        ];
        const accuracyShuffledInputProviderGenerator =
            new this.deeplearn.InGPUMemoryShuffledInputProviderBuilder([validationData.input, validationData.target]);
        const [accuracyInputProvider, accuracyLabelProvider] = accuracyShuffledInputProviderGenerator.getInputProviders();

        const accuracyFeeds = [
            {tensor: this.inputTensor, data: accuracyInputProvider},
            {tensor: targetTensor, data: accuracyLabelProvider}
        ];
        if (!this.graphRunner) this.startGraphRunner(costCallback, metricCallback);
        const EVAL_INTERVAL_MS = 10000;
        const COST_INTERVAL_MS = 5000;

        console.log('start training');

        const optimizer = new this.deeplearn.SGDOptimizer(learningRate);
        //this.session.train(costTensor, trainFeeds, batchSize, optimizer, this.deeplearn.MetricReduction.MEAN);
        this.graphRunner.train(costTensor, trainFeeds, batchSize, optimizer, batchCount, accuracyTensor, accuracyFeeds, this.deeplearn.MetricReduction.MEAN, EVAL_INTERVAL_MS, COST_INTERVAL_MS);

        // if (i % 10 == 0) {
        //     console.log(`training iteration ${i} of ${batchCount}`);
        // }
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
