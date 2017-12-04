const DataStore = require('../src/dataStore');

describe('The dataRetriever', () => {
    const trainingData = {
        inputData : [],
        targetData : []
    };
    let readStreamMock;
    let fsMock;
    let parseMock;
    let store;

    beforeEach(() => {
        readStreamMock = {
            pipe: () => readStreamMock,
            on: (type, cb) => {
                if ('data' === type) store.trainingData = trainingData;
                if ('end' === type) cb();
                return readStreamMock;
            }
        };
        fsMock = {
            createReadStream : () => readStreamMock
        };

        parseMock = () => {};

        store = new DataStore();
        store.fs = fsMock;
        store.parse = parseMock;
    });

    it('should load training data', (done) => {
        spyOn(readStreamMock, 'pipe').and.callThrough();
        spyOn(readStreamMock, 'on').and.callThrough();

        store.loadTrainingData()
            .then(data => {
                expect(data).toBe(trainingData);
                done();
            })
            .catch(console.error)

    })
});
