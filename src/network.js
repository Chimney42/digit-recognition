const deeplearn = require('deeplearn');
class Network {
    constructor() {
        this.graph = new deeplearn.Graph();
        this.layerCount = 0;
        this.lastLayer;
    }

}

module.exports = Network;
