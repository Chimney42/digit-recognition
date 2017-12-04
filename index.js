const trainingDataPath = 'data/digit-recognition/train.csv';
const testDataPath = 'data/digit-recognition/test.csv';
const submissionDataPath = 'data/digit-recognition/submission.txt';
const fs = require('fs');
const parse = require('csv-parse');
const deeplearn = require('deeplearn');

const targets = [];
const inputs = [];

const createVectorRepresentation = (length, index) => {
    const data = [];
    for (let i = 0; i < length; i ++) {
        data.push(false);
    }
    data[index] = true;
    return deeplearn.Array1D.new(data);
};

const createFullyConnectedLayer = (graph, inputLayer, layerIndex, sizeOfThisLayer) => {
    return graph.layers.dense('fully_connected_' + layerIndex, inputLayer, sizeOfThisLayer, (x) => graph.sigmoid(x), true);
};

const normalise = (value, maxValue) => value / maxValue;


const validationIndices = [1, 0, 16, 7, 32, 19, 21, 6, 20, 31];

const pixelCount = 784;
let inputData = [];
let targetData = [];


fs.createReadStream(trainingDataPath)
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        const target = csvrow.shift();
        if ('label' != target) {
            targetData.push(createVectorRepresentation(10, parseInt(target)));

            const inputRow = deeplearn.Array1D.new(csvrow);
            inputData.push(inputRow);

            if (inputData.length % 1000 === 0) console.log(`storing datapoint ${inputData.length} for training`)
        }
    })
    .on('end',function() {
        const graph = new deeplearn.Graph();

        const inputTensor = graph.placeholder('inputs', [pixelCount]);
        const targetTensor = graph.placeholder('target', [10]);

        const shuffledInputProviderBuilder = new deeplearn.InCPUMemoryShuffledInputProviderBuilder([inputData, targetData]);
        const [inputProvider, targetProvider] = shuffledInputProviderBuilder.getInputProviders();

        const feedEntries = [
            {tensor: inputTensor, data: inputProvider},
            {tensor: targetTensor, data: targetProvider}
        ];

        // Create 3 fully connected layers, each with half the number of nodes of
        // the previous layer. The first one has 16 nodes, the second 8 and the third 4 nodes
        let fullyConnectedLayer = createFullyConnectedLayer(graph, inputTensor, 0, 16);
        fullyConnectedLayer = createFullyConnectedLayer(graph, fullyConnectedLayer, 1, 8);
        fullyConnectedLayer = createFullyConnectedLayer(graph, fullyConnectedLayer, 2, 4);
        const predictionTensor = createFullyConnectedLayer(graph, fullyConnectedLayer, 3, 10);
        const costTensor = graph.meanSquaredCost(targetTensor, predictionTensor);

        const session = new deeplearn.Session(graph, new deeplearn.NDArrayMathCPU());
        const optimizer = new deeplearn.SGDOptimizer(0.0002); //learning rate
        const batchSize = 100;
        const NUM_BATCHES = 500;

        //console.log(inputData[0], targetData[0]);

        console.log('start training');
        for (let i = 0; i < NUM_BATCHES; i++) {
            // Train takes a cost tensor to minimize. Trains one batch. Returns the
            // average cost as a Scalar.
            session.train(costTensor, feedEntries, batchSize, optimizer, deeplearn.CostReduction.MEAN);

            if (i % 10 == 0) {
                console.log(`training iteration ${i} of ${NUM_BATCHES}`);
                /*validationIndices.forEach(index => {
                    const validationEntries = [{tensor: inputTensor, data: inputData[index]}];
                    session.eval(predictionTensor, validationEntries)
                        .data()
                        .then(data => {
                            console.log(`training iteration ${i}`);
                            console.log('prediction', data);
                            console.log('label', targetData[index])
                        })
                });
*/
            }
        }

        const testIndex = 1;

        fs.createReadStream(testDataPath)
            .pipe(parse({delimiter: ','}))
            .on('data', function(csvrow) {
                if ('pixel0' != csvrow[0]) {
                    const inputRow = deeplearn.Array1D.new(csvrow);
                    // session.eval can take NDArrays as input data.
                    const testFeedEntries = [{tensor: inputTensor, data: inputRow}];
                    session.eval(predictionTensor, testFeedEntries)
                        .data()
                        .then(data => {
                            console.log(data);
                            const label = data.indexOf(data.reduce(( acc, cur ) => Math.max( acc, cur )));
                            const string = `${testIndex},${label}`;
                            fs.appendFileSync(submissionDataPath, string + '\n');
                        })
                }
            })
            .on('end',function() {
                console.log('done');
            });
    });