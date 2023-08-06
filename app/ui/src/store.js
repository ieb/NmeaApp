"use strict;"


class Store {
    constructor() {
        this.state = {};
        this.history = {
            awa: new AngularHistory(),
            aws: new LinearHistory(),
            stw: new LinearHistory()
        };

    }

    update(handler) {
        const sentences = handler.updatesSince(this.state.lastUpdate);
        this.state.lastUpdate = sentences.slice(-1)[0].lastUpdate;
        if ( sentences[0].id === 'timestamp' ) {
            return;
        }
        const newState = {};
        for (var k in sentences) {
            if (sentences[k].id === 'MWV' ) {
                if ( sentences[k].fields[4] === 'A' && sentences[k].fields[1] === 'R' && sentences[k].fields[3] === 'N' ) {
                    newState.awa = sentences[k].fields[0]*Math.PI/180;
                    newState.aws = sentences[k].fields[2]*0.514444;
                }
            } else if (sentences[k].id === 'ROL') {
                newState.roll = sentences[k].fields[0]*Math.PI/180;
            } else if ( sentences[k].id === 'VHW') {
                newState.hdm = sentences[k].fields[2]*Math.PI/180;
                newState.stw = sentences[k].fields[4]*0.514444;
            } else if ( sentences[k].id === 'HDG') {
                newState.hdm = sentences[k].fields[0]*Math.PI/180;
                newState.variation = sentences[k].fields[3]*Math.PI/180;
                if ( sentences[k].fields[4] == 'W') {
                    newState.variation = -newState.variation;
                }
            } else if (sentences[k].id == 'VTG') {
                newState.cogt = sentences[k].fields[0]*Math.PI/180;
                newState.sog = sentences[k].fields[4]*0.514444;
            }
        }
        //console.log("Updates ",sentences.length, newState);

        this.mergeUpdate(newState, this.state.lastUpdate);
    }

    mergeUpdate(newState, ts) {
        for ( var k in newState ) {
            if ( newState[k] !== this.state[k]) {
                this.state.lastChange = ts;
                this.state[k]= newState[k];
            }
        }
        this.updateHistory();        
    }

    updateHistory() {
        for (var k in this.history) {
            this.history[k].updateSample(this.state[k]);
        }

    }
}

class LinearHistory {
    constructor(samplePeriod, storePeriod, maxLength) {
        this.nextSample = 0;
        this.nextStore = 0;
        this.samplePeriod = samplePeriod || 1000;
        this.storePeriod = storePeriod || 10000;  // 10s
        this.nsamples = Math.round(this.storePeriod/this.samplePeriod);
        this.maxLength =  maxLength || 180; // default 1800s or 30m
        this.value = undefined;
        this.data = [];
    }

    updateSample(v) {
        const now = Date.now();
        if ( this.nextSample < now) {
            this.nextSample = now + this.samplePeriod;
            if ( this.value == undefined ) {
                this.value = v;
            } else {
                this.value = (this.value*(this.nsamples-1)+v)/(this.nsamples);
            }
        }
        if ( this.nextStore < now) {
            this.nextStore = now + this.storePeriod;
            this.data.unshift(this.value);
            if ( this.data.length > this.maxLength ) {
                this.data.pop()
            }
        }
    }
}

class AngularHistory {
    constructor(samplePeriod, storePeriod, nsamples, maxLength) {
        this.nextSample = 0;
        this.nextStore = 0;
        this.samplePeriod = samplePeriod || 1000;
        this.storePeriod = storePeriod || 10000;  // 10s
        this.nsamples = Math.round(this.storePeriod/this.samplePeriod);
        this.maxLength =  maxLength || 180; // default 1800s or 30m
        this.value = undefined;
        this.data = [];
    }

    updateSample(v) {
        const now = Date.now();
        if ( this.nextSample < now) {
            this.nextSample = now + this.samplePeriod;
            // calculate the angular mean.
            // if standard deviation was required then we would need to hold
            // store the samples.
            if ( this.value == undefined ) {
                this.value = v;
            } else {
                this.value = Math.atan2(
                    (Math.sin(this.value)*(this.nsamples-1)+Math.sin(v))/this.nsamples,
                    (Math.cos(this.value)*(this.nsamples-1)+Math.cos(v))/this.nsamples);                
            }
        }
        if ( this.nextStore < now) {
            this.nextStore = now + this.storePeriod;
            this.data.unshift(this.value);
            if ( this.data.length > this.maxLength ) {
                this.data.pop()
            }
        }
    }    
}

export { Store };