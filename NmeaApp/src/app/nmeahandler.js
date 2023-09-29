"use strict";


class NMEA0183Handler {
    constructor() {
        this.sentences = {};
    }


    parseSentence(line) {
        const sentenceIdent = this._getSentenceId(line);
        if ( sentenceIdent !== undefined) {
            this._mergeSentence(sentenceIdent.key, sentenceIdent);
        }
    }

    updateSentence(id, fields, lastUpdate, sendPeriod) {
        sendPeriod = sendPeriod || 5000;
        let check = 0;
        let line = fields.join(',');
        for (var i = 1; i < line.length; i++) {
            check = check ^ line.charCodeAt(i);
        };
        check = check.toString(16);
        line = line+'*'+check;
        this._mergeSentence(id, {
                key: fields[0].substring(1,6),
                talker: fields[0].substring(1,3),
                id: fields[0].substring(3,6),
                checksum: check,
                fields: fields.slice(1),
                line: line,
                lastUpdate: lastUpdate,
                sendPeriod: sendPeriod
        });
    }

    _mergeSentence(id, sentence) {
        if ( this.sentences[id] === undefined ) {
            sentence.nextSend = 0;
            sentence.sendPeriod = sentence.sendPeriod || 5000;
            this.sentences[id] = sentence;
        } else {
            for (const k in sentence) {
                this.sentences[id][k] = sentence[k];
            }
        }
    }

    getSentence(id, filter) {
        const matched = [];
        for(var s in this.sentences) {
            if ( this.sentences[s].id == id ) {
                if ( filter(this.sentences[id].fields) ) {
                    matched.push(this.sentences[s]);
                }
            }
        }
        matched.sort((a, b) => {
            return a.lastUpdate - b.lastUpdate;
        });
        return matched;     
    }

    getSentenceByKey(key) {
        return this.sentences[key];
    }


    getSentencesToSend() {
        const now = Date.now();
        const matched = [];        
        for(var s in this.sentences) {
            if ( this.sentences[s].nextSend < now) {
                this.sentences[s].nextSend = now + this.sentences[s].sendPeriod;
                matched.push(this.sentences[s]);
            }
        }
        return matched;
    }

    updatesSince(time) {
        const matched = [];
        for(var s in this.sentences) {
            if ( this.sentences[s].lastUpdate > time) {
                matched.push(this.sentences[s]);
            }
        }
        matched.sort((a, b) => {
            return a.lastUpdate - b.lastUpdate;
        });
        if ( matched.length == 0 ) {
            matched.push({
                id: 'timestamp',
                lastUpdate: Date.now()
            });
        }
        return matched;
    }

    dump() {
        console.log(this.sentences);
    }


//$IIVHW,356.9,T,356.8,M,5.1,N,9.4,K*5D
    _getSentenceId(line) {
        const parts = this._getParts(line);
        if ( parts !== undefined) {
            return {
                key: parts[0].substring(1,6),
                talker: parts[0].substring(1,3),
                id: parts[0].substring(3,6),
                checksum: line.split('*')[1],
                fields: parts.slice(1),
                line: line,
                lastUpdate: Date.now()
            }                    
        }
        return undefined;
    }

    _getParts(sentence) {
        if (sentence && sentence.charAt(0) == '$') {
            const parts = sentence.split('*');
            let check = 0;
            for (var i = 1; i < parts[0].length; i++) {
              check = check ^ parts[0].charCodeAt(i);
            };
            if (parseInt(parts[1], 16) == check) {
                return parts[0].split(',');
            }
        }
        return undefined;
    }
}

module.exports =  { NMEA0183Handler };