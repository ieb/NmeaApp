"use strict;"


class Store {
    constructor() {
        this.state = {};
        this.history = {
            awa: new AngularHistory(),
            aws: new LinearHistory(),
            stw: new LinearHistory(),
            aws: new LinearHistory(),
            tws: new LinearHistory(),
            twa: new AngularHistory(),
            stw: new LinearHistory(),
            cogt: new AngularHistory(),
            cogm: new AngularHistory(),
            sog: new LinearHistory(),
            hdt: new AngularHistory(),
            hdm: new AngularHistory(),
            gwdt: new AngularHistory(),
            gwdm: new AngularHistory(),
            vmg: new LinearHistory(),
            roll: new AngularHistory(),
            leeway: new AngularHistory(),
            variation: new AngularHistory(),
            polarSpeed: new LinearHistory(),
            polarSpeedRatio: new LinearHistory(),
            polarVmg: new LinearHistory(),
            targetVmg: new LinearHistory(),
            targetStw: new LinearHistory(),
            targetTwa: new AngularHistory(),
            targetAwa: new AngularHistory(),
            targetAws: new LinearHistory(),
            polarVmgRatio: new LinearHistory(),
            oppositeHeadingTrue: new AngularHistory(),
            oppositeTrackTrue: new AngularHistory(),
            oppositeTrackMagnetic: new AngularHistory(),
            oppositeHeadingMagnetic: new AngularHistory()
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
        this.storePeriod = storePeriod || 5000;  // 10s
        this.nsamples = Math.round(this.storePeriod/this.samplePeriod);
        this.maxLength =  maxLength || 180; // default 1800s or 30m
        this.value = 0.0;
        this.mean = 0.0;
        this.stdev = 0.0;
        this.min = 0.0;
        this.max = 0.0;
        this.data = [];
    }

    updateSample(v) {
        const now = Date.now();
        if ( this.nextSample < now) {
            this.nextSample = now + this.samplePeriod;
            if ( v !== undefined && !Number.isNaN(v) ) {
                if ( this.value == undefined  ) {
                    this.value = v;
                } else {
                    this.value = (this.value*(this.nsamples-1)+v)/(this.nsamples);
                }                
            }
        }
        if ( this.nextStore < now) {
            this.nextStore = now + this.storePeriod;
            this.data.push(this.value);
            if ( this.data.length > this.maxLength ) {
                this.data.shift()
            }
            let sum = 0.0;
            let n = 0.0;
            for (let i = 0; i < this.data.length; i++) {
                const weight = (i+1)/2;
                sum += this.data[i]*weight;
                n += weight;
            }
            this.mean = sum/n;
            sum = 0.0;
            n = 0.0;
            for (let i = 0; i < this.data.length; i++) {
                const weight = (i+1)/2;
                sum += (this.data[i]-this.mean)*(this.data[i]-this.mean)*weight;
                n += weight;
            }
            this.stdev = Math.sqrt(sum/n);
            this.min = this.mean;
            this.max = this.mean;
            for (let i = this.data.length - 1; i >= 0; i--) {
                this.min = Math.min(this.data[i],this.min);
                this.max = Math.max(this.data[i],this.max);
            };
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
        this.value = 0.0;
        this.sinValue = 0.0;
        this.cosValue = 0.0;
        this.mean = 0.0;
        this.stdev = 0.0;
        this.min = 0.0;
        this.max = 0.0;
        this.data = [];
        this.sinData = [];
        this.cosData = [];
    }

    updateSample(v) {
        const now = Date.now();
        if ( this.nextSample < now) {
            this.nextSample = now + this.samplePeriod;
            // calculate the angular mean.
            // if standard deviation was required then we would need to hold
            // store the samples.
            if ( v !== undefined  && !Number.isNaN(v) ) {
                if ( this.value == undefined ) {
                    this.sinValue = Math.sin(v);
                    this.cosValue = Math.cos(v);
                    this.value = v;
                } else {
                    this.sinValue = (this.sinValue*(this.nsamples-1)+Math.sin(v))/this.nsamples;
                    this.cosValue = (this.cosValue*(this.nsamples-1)+Math.cos(v))/this.nsamples;
                    this.value = Math.atan2(this.sinValue, this.cosValue);
                }
            }
        }
        if ( this.nextStore < now) {
            this.nextStore = now + this.storePeriod;
            if ( this.value != undefined ) {

                this.data.push(this.value);
                this.sinData.push(this.sinValue);
                this.cosData.push(this.cosValue);
                if ( this.data.length > this.maxLength ) {
                    this.data.shift()
                    this.sinData.shift()
                    this.cosData.shift()
                } 


                let sinsum = 0.0, cossum= 0.0;
                let n = 0.0;
                for (let i = 0; i < this.data.length; i++) {
                    const weight = (i+1)/2;
                    sinsum += this.sinData[i]*weight;
                    cossum += this.cosData[i]*weight;
                    n += weight;
                }
                this.mean = Math.atan2(sinsum/n,cossum/n);

                // probably not the right way of calculating a SD of a circular
                // value, however it does produces a viable result.
                // other methods are estimates.
                // Not 100% certain about the weighting here.
                let diffsum = 0.0;
                n = 0.0;
                for (let i = 0; i < this.data.length; i++) {
                    const weight = (i+1)/2;
                    let a = this.data[i]-this.mean;
                    // find the smallest sweep from the mean.
                    if ( a > Math.PI ) {
                        a = a - 2*Math.PI;
                    } else if ( a < -Math.PI ) {
                        a = a + 2*Math.PI;
                    }
                    diffsum += a*a*weight;
                    n += weight;
                }
                this.stdev = Math.sqrt(diffsum/n);
                this.min = this.mean;
                this.max = this.mean;
                for (var i = this.data.length - 1; i >= 0; i--) {
                    this.min = Math.min(this.data[i],this.min);
                    this.max = Math.max(this.data[i],this.max);
                };
            }
        }
    }    
}

export { Store };