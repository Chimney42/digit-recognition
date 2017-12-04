const submissionDataPath = 'data/submission.csv';
const testDataPath = 'data/test.csv';
const trainDataPath = 'data/train.csv';

const fs = require('fs');
const deeplearn = require('deeplearn');
const Storage = require('./src/dataStore');
const NetworkFactory = require('./src/networkFactory');

const config = {
    featureCount: 784,
    hiddenLayerSizes: [2, 4],
    layers: [

    ],
    labelCount: 10,
    activationFunction : 'sigmoid'
};
const batchSize = 100;
const batchCount = 500;

const validationIndices = [1, 0, 16, 7, 32, 19, 21, 6, 20, 31];

let inputData = [];
let targetData = [];

const storage = new Storage();
storage.trainingDataPath = trainDataPath;
storage.testDataPath = testDataPath;
let network;
storage.loadTrainingData()
    .then(trainingData => {
        inputData = trainingData.inputData;
        targetData = trainingData.targetData;

        const factory = new NetworkFactory();
        network = factory.createNetwork(config);

        network.train(inputData, targetData, batchSize, batchCount, 0.1);
        return storage.loadTestData()
    })
    .then(testData => {
        let testIndex = 1;

        testData.inputData.forEach(inputRow => {
            console.log(`training dataset ${testIndex}`);
            network.predict(inputRow)
                .then(label => {
                    const string = `${testIndex},${label}`;
                    fs.appendFileSync(submissionDataPath, string + '\n');
                });
            testIndex++;
        })
    })
.catch(console.error);