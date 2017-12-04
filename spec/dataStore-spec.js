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

        it('should transform each row', (done) => {
            const target = 0;
            const input = [0, 0, 255];
            const expected = [0, 0, 1];
            spyOn(readStreamMock, 'on').and.callFake((type, cb) => {
                if ('data' === type) cb([target].concat(input));
                if ('end' === type) cb();
                return readStreamMock;
            });

            store.loadTrainingData()
                .then(data => {
                    expect(Array.from(data.inputData[0].getData().values)).toEqual(expected);
                    expect(data.targetData[0]).toEqual(store.createVectorRepresentation(10, target));
                    done();
                })
        })
    });

    describe('loading test data', () => {
        it('should load from file', (done) => {
            spyOn(fsMock, 'createReadStream').and.callThrough();
            spyOn(readStreamMock, 'on').and.callFake((type, cb) => {
                if ('data' === type) store.testData = testData;
                if ('end' === type) cb();
                return readStreamMock;
            });
            store.loadTestData()
                .then(data => {
                    expect(fsMock.createReadStream).toHaveBeenCalled();
                    expect(data).toBe(testData);
                    done();
                })
                .catch(console.error)
        });

        it('should not load from file if already initiated', (done) => {
            store.testData = testData;
            store.testData.init = true;
            spyOn(fsMock, 'createReadStream');

            store.loadTestData()
                .then(data => {
                    expect(fsMock.createReadStream).not.toHaveBeenCalled();
                    expect(data).toBe(testData);
                    done();
                })
                .catch(console.error)
        });

        it('should transform each row', (done) => {
            const input = [0, 0, 255];
            const expected = [0, 0, 1];
            spyOn(readStreamMock, 'on').and.callFake((type, cb) => {
                if ('data' === type) cb(input);
                if ('end' === type) cb();
                return readStreamMock;
            });

            store.loadTestData()
                .then(data => {
                    expect(Array.from(data.inputData[0].getData().values)).toEqual(expected);
                        done();
                })
        })
    });

    it('should do one-hot-encoding on labels', (done) => {
        const label = 4;
        const vector = store.createVectorRepresentation(10, label);
        vector.data()
            .then(data => {
                expect(data[label]).toBeTruthy();
                let random = label;
                while (random === label) {
                    random = Math.floor(Math.random() * 10);
                }
                expect(data[random]).toBeFalsy();
                done();
            })
    });
});
