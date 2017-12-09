const DataStore = require('../src/dataStore');

describe('The dataStore', () => {
    const trainingDataPath = 'data/train.csv';
    const trainingData = {
        inputData : [],
        targetData : []
    };
    const testDataPath = 'data/test.csv';
    const testData = {
        inputData : []
    };
    let requestMock;
    let fetchMock;
    let store;

    beforeEach(() => {
        requestMock = class ReqMock {};
        fetchMock = jasmine.createSpy('fetch');
        store = new DataStore(requestMock, fetchMock);
    });

    describe('loading training data', () => {
        it('should load from file', (done) => {
            spyOn(store, 'transformTrainingData');
            const responsePayload = 'data';
            const response = { text: () => Promise.resolve(responsePayload)};
            fetchMock.and.returnValue(Promise.resolve(response));

            store.loadTrainingData()
                .then(data => {
                    expect(fetchMock).toHaveBeenCalled();
                    expect(store.transformTrainingData).toHaveBeenCalledWith(responsePayload);
                    trainingData.init = true;
                    expect(data).toEqual(trainingData);
                    done();
                })
                .catch(console.error)
        });

        it('should not load from file if already initiated', (done) => {
            store.trainingData = trainingData;
            store.trainingData.init = true;

            store.loadTrainingData()
                .then(data => {
                    expect(fetchMock).not.toHaveBeenCalled();
                    expect(data).toBe(trainingData);
                    done();
                })
                .catch(console.error)
        });


        it('should transform each row', () => {
            const header = 'some header';
            const target = 0;
            const input = [0, 0, 255];
            const expected = [0, 0, 1];

            const row = [target].concat(input).join(',');
            const dataString = [header, row].join('\n');

            store.transformTrainingData(dataString);
            expect(Array.from(store.trainingData.inputData[0].getData().values)).toEqual(expected);
            expect(store.trainingData.targetData[0]).toEqual(store.createVectorRepresentation(10, target));
        })
    });

    describe('loading test data', () => {
        it('should load from file', (done) => {
            spyOn(store, 'transformTestData');
            const responsePayload = 'data';
            const response = { text: () => Promise.resolve(responsePayload)};
            fetchMock.and.returnValue(Promise.resolve(response));

            store.loadTestData()
                .then(data => {
                    expect(fetchMock).toHaveBeenCalled();
                    expect(store.transformTestData).toHaveBeenCalledWith(responsePayload);
                    testData.init = true;
                    expect(data).toEqual(testData);
                    done();
                })
                .catch(console.error)
        });

        it('should not load from file if already initiated', (done) => {
            store.testData = testData;
            store.testData.init = true;

            store.loadTestData()
                .then(data => {
                    expect(fetchMock).not.toHaveBeenCalled();
                    expect(data).toBe(testData);
                    done();
                })
                .catch(console.error)
        });

        it('should transform each row', () => {
            const header = 'some header';
            const input = [0, 0, 255];
            const expected = [0, 0, 1];

            const row = input.join(',');
            const dataString = [header, row].join('\n');

            store.transformTestData(dataString);
            expect(Array.from(store.testData.inputData[0].getData().values)).toEqual(expected);
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
