const deeplearn = require('deeplearn');
const parse = require('csv-parse');

class DataStore {
    constructor() {
        this.fs = require('fs');
        this.trainingDataPath = '../data/train.csv';
        this.testDataPath = '../data/test.csv';

        this.trainingData = {
            init: false,
            inputData : [],
            targetData : []
        };

        this.testData = {
            init: false,
            inputData : []
        };
    }

    createVectorRepresentation(length, index) {
        const data = [];
        for (let i = 0; i < length; i ++) {
            data.push(false);
        }
        data[index] = true;
        return deeplearn.Array1D.new(data);
    };


    loadTrainingData() {
        return new Promise((resolve, reject) => {
            if (this.trainingData.init) {
                resolve(this.trainingData);
            } else {
                this.fs.createReadStream(this.trainingDataPath)
                    .pipe(parse({delimiter: ','}))
                    .on('data', (csvrow) => {
                        const target = csvrow.shift();
                        if ('label' != target) {
                            this.trainingData.targetData.push(this.createVectorRepresentation(10, parseInt(target)));

                            const inputRow = deeplearn.Array1D.new(csvrow);
                            this.trainingData.inputData.push(inputRow);

                            if (this.trainingData.inputData.length % 1000 === 0) {
                                console.log(`storing datapoint ${this.trainingData.inputData.length} for training`)
                            }
                        }
                    })
                    .on('end', () => {
                        this.trainingData.init = true;
                        resolve(this.trainingData);
                    })
            }
        });
    }

    loadTestData() {
        return new Promise((resolve, reject) => {
            if (this.testData.init) {
                resolve(this.testData);
            } else {
                this.fs.createReadStream(this.testDataPath)
                    .pipe(parse({delimiter: ','}))
                    .on('data', (csvrow) => {
                        if ('pixel0' != csvrow[0]) {
                            this.testData.push(deeplearn.Array1D.new(csvrow));
                        }
                    })
                    .on('end', () => {
                        this.testData.init = true;
                        resolve(this.testData);
                    });
            }
        });
    }
}

module.exports = DataStore;
