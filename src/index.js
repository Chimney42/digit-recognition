const trainDataPath = 'data/train.csv';
const testDataPath = 'data/test.csv';
const submissionDataPath = 'data/submission.csv';

const deeplearn = require('deeplearn');
const Storage = require('./dataStore');
const NetworkFactory = require('./network/factory');

const config = {
    featureCount: 784,
    layers: [],
    predictionLayer: {
        type: 'fully_connected',
        activation: 'sigmoid',
        size: 10
    },
    labelCount: 10
};
const batchSize = 64;
const batchCount = 64;

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
        let testIndex = 0;

        testData.inputData.forEach(inputRow => {
            testIndex++;
            const scopedIndex = testIndex;
            console.log(`predicting dataset ${testIndex}`);
            network.predict(inputRow)
                .then(label => {
                    const string = `${scopedIndex},${label}`;
                    fs.appendFileSync(submissionDataPath, string + '\n');
                });
        })
    })
.catch(console.error);
