const parse = require('csv-parse');
class DataStore {
    constructor() {
        this.fs = require('fs');
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
                    .pipe(parse({delimiter: ','}))
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
