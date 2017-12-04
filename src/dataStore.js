class DataStore {
    constructor() {
        this.fs = require('fs');
        this.parse = require('csv-parse');
        this.trainingDataPath = '../data/train.csv';

        this.trainingData = {
            init: false,
            inputData : [],
            targetData : []
        };
    }

    loadTrainingData() {
        return new Promise((resolve, reject) => {
            if (this.trainingData.init) {
                resolve(this.trainingData);
            } else {
                this.fs.createReadStream(this.trainingDataPath)
                    .pipe(this.parse({delimiter: ','}))
                    .on('data', (csvrow) => {

                    })
                    .on('end', () => {
                        this.trainingData.init = true;
                        resolve(this.trainingData);
                    })
            }
        });
    }
}

module.exports = DataStore;
