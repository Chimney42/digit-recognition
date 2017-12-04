const DataStore = require('../src/dataStore');

describe('The dataStore', () => {
    const trainingData = {
        inputData : [],
        targetData : []
    };
    const testData = {
        inputData : []
    };
    let readStreamMock;
    let fsMock;
    let parseMock;
    let store;

    beforeEach(() => {
        readStreamMock = {
            pipe: () => readStreamMock,
            on: () => readStreamMock
        };
        fsMock = {
            createReadStream : () => readStreamMock
        };

        store = new DataStore();
        store.fs = fsMock;
        store.parse = parseMock;
    });

    describe('loading training data', () => {
        it('should load from file', (done) => {
            spyOn(fsMock, 'createReadStream').and.callThrough();
            spyOn(readStreamMock, 'on').and.callFake((type, cb) => {
                if ('data' === type) store.trainingData = trainingData;
                if ('end' === type) cb();
                return readStreamMock;
            });
            store.loadTrainingData()
                .then(data => {
                    expect(fsMock.createReadStream).toHaveBeenCalled();
                    expect(data).toBe(trainingData);
                    done();
                })
                .catch(console.error)
        });

        it('should not load from file if already initiated', (done) => {
            store.trainingData = trainingData;
            store.trainingData.init = true;
            spyOn(fsMock, 'createReadStream');

            store.loadTrainingData()
                .then(data => {
                    expect(fsMock.createReadStream).not.toHaveBeenCalled();
                    expect(data).toBe(trainingData);
                    done();
                })
                .catch(console.error)
        });
    })
});
