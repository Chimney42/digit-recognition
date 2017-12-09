const deeplearn = require('deeplearn');

class DataStore {
    constructor(requestMock, fetchMock) {
        this.Request = requestMock || Request;
        this.fetch = fetchMock || fetch;

        this.trainingDataPath = 'data/train.csv';
        this.testDataPath = 'data/test.csv';

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


    normalize(value, maxValue) {
        return value / maxValue;
    }

    transformTrainingData(dataString) {
        const rows = dataString.split('\n');
        const header = rows.shift();

        rows.forEach(row => {
            if (row) {
                row = row.split(',');
                let target = row.shift();
                target = this.createVectorRepresentation(10, parseInt(target));
                this.trainingData.targetData.push(target);

                const inputRow = row.map(val => this.normalize(val, 255));
                this.trainingData.inputData.push(deeplearn.Array1D.new(inputRow));

                if (this.trainingData.inputData.length % 1000 === 0) {
                    console.log(`storing datapoint ${this.trainingData.inputData.length} for training`)
                }
            }
        });
    }


    loadTrainingData() {
        return new Promise((resolve, reject) => {
            if (this.trainingData.init) {
                resolve(this.trainingData);
            } else {
                const request = new this.Request(this.trainingDataPath);
                this.fetch(request)
                    .then(response => {
                        return response.text();
                    })
                    .then(text => {
                        this.transformTrainingData(text);
                        this.trainingData.init = true;
                        resolve(this.trainingData);
                    });
            }
        });
    }

    transformTestData(dataString) {
        const rows = dataString.split('\n');
        const header = rows.shift();

        rows.forEach(row => {
            row = row.split(',');
            const inputRow = row.map(val => this.normalize(val, 255));
            this.testData.inputData.push(deeplearn.Array1D.new(inputRow));
            if (this.testData.inputData.length % 1000 === 0) {
                console.log(`storing datapoint ${this.testData.inputData.length} for testing`)
            }
        });
    }

    loadTestData() {
        return new Promise((resolve, reject) => {
            if (this.testData.init) {
                resolve(this.testData);
            } else {
                const request = new this.Request(this.testDataPath);
                this.fetch(request)
                    .then(response => {
                        return response.text()
                    })
                    .then(text => {
                        this.transformTestData(text);
                        this.testData.init = true;
                        resolve(this.testData);
                    })
            }
        });
    }
}

module.exports = DataStore;
