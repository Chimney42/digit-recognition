const deeplearn = require('deeplearn');

class DataStore {
    constructor(requestMock, fetchMock) {
        this.Request = requestMock || Request;
        this.fetch = fetchMock || fetch.bind(window);

        this.trainingDataPath = 'data/train.csv';
        this.testDataPath = 'data/test.csv';

        this.trainingData = {
            init: false,
            inputData : [],
            targetData : []
        };

        this.validationData = {
            init: false,
            inputData : [],
            targetData: []
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

    transformLabeledData(text) {
        const rows = text.split('\n');
        const header = rows.shift();
        const result = [];
        rows.forEach(row => {
            if (row) {
                row = row.split(',');
                result.push(row)
            }
        });
        return result;
    }

    loadLabeledData() {
        return new Promise((resolve, reject) => {
            const request = new this.Request(this.trainingDataPath);
            this.fetch(request)
                .then(response => {
                    return response.text();
                })
                .then(text => {
                    resolve(this.transformLabeledData(text));
                });
        });
    }

    transformTrainingData(data) {
        data.forEach(row => {
            let target = row.shift();
            target = this.createVectorRepresentation(10, parseInt(target));
            this.trainingData.targetData.push(target);

            const inputRow = row.map(val => this.normalize(val, 255));
            this.trainingData.inputData.push(deeplearn.Array1D.new(inputRow));

            if (this.trainingData.inputData.length % 1000 === 0) {
                console.log(`storing datapoint ${this.trainingData.inputData.length} for training`)
            }
        });
    }

    transformValidationData(data) {
        data.forEach(row => {
            let target = row.shift();
            target = this.createVectorRepresentation(10, parseInt(target));
            this.validationData.targetData.push(target);

            const inputRow = row.map(val => this.normalize(val, 255));
            this.validationData.inputData.push(deeplearn.Array1D.new(inputRow));

            if (this.validationData.inputData.length % 1000 === 0) {
                console.log(`storing datapoint ${this.validationData.inputData.length} for validation`)
            }
        });
    }


    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     */
    shuffleArray(array) {
        array = [].concat(array);
        const newArray = [];
        while (array.length > 0) {
            const index = Math.floor(Math.random() * array.length);
            newArray.push(array[index]);
            array.splice(index, 1);
        }
        return newArray;
    }

    initializeData() {
        return this.loadLabeledData()
            .then(labeledData => {
                const data = this.shuffleArray(labeledData);
                const length = data.length / 5;
                const validationData = data.splice(0, length);

                this.transformTrainingData(data);
                this.trainingData.init = true;
                this.transformValidationData(validationData);
                this.validationData.init = true;
            })
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
