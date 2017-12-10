const chartJs = require('chart.js');
const chartCtx = document.getElementById("chart").getContext('2d');
const dataSets = [{
        label: 'avgCost',
        data: [],
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        fill: false
    }, {
        label: 'accuracy',
        data: [],
        backgroundColor: 'rgb(54, 162, 235)',
        borderColor: 'rgb(54, 162, 235)',
        fill: false
    }];
const chartConfig = {
    type: 'line',
    data: {
        datasets: dataSets
    },
    options: {
        title:{
            display:true,
            text:'Cost & Accuracy for training'
        },
        responsive: true,
        elements: {
          line : {
              tension: 0
          }
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'batches trained'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'value'
                },
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
};
const chart = new chartJs.Chart(chartCtx, chartConfig);

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
    }
};
const batchSize = 64;
const batchCount = 1000;
let correctPredictions = 0;
let predictionsMade = 0;

const validationIndices = [1, 0, 16, 7, 32, 19, 21, 6, 20, 31];

let inputData = [];
let targetData = [];

const storage = new Storage();
storage.trainingDataPath = trainDataPath;
storage.testDataPath = testDataPath;
let network;
storage.initializeData()
    .then(() => {
        const trainingData = {
            input: storage.trainingData.inputData,
            target: storage.trainingData.targetData
        };

        const validationData = {
            input: storage.validationData.inputData,
            target: storage.validationData.targetData
        };

        const factory = new NetworkFactory();
        network = factory.createNetwork(config);

        const updateChartData = (dataName, data) => {
            const batchesTrained = data.x;
            if (chartConfig.data.labels.indexOf(batchesTrained) === -1) chart.data.labels.push(batchesTrained);

            const dataSet = dataSets.find(set => dataName === set.label);
            dataSet.data.push(data);
            chart.update();
        };

        const costCallBack = (avgCost) => {
            updateChartData('avgCost', {x: network.graphRunner.getTotalBatchesTrained()+1, y: avgCost.get()});
        };

        const metricCallBack = (metric) => {
            predictionsMade++;
            const isCorrect = metric.get();
            if (isCorrect) correctPredictions++;

            const batchesTrained = network.graphRunner.getTotalBatchesTrained() + 1;
            updateChartData('accuracy', {x: batchesTrained, y: correctPredictions / predictionsMade});
        };

        network.train(trainingData, validationData, batchSize, batchCount, 0.1, costCallBack, metricCallBack);
        return storage.loadTestData()
    })
    /*.then(testData => {
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
    })*/
.catch(console.error);
