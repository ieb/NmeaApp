"use strict;"


class DisplayUtils {
    static calMinMax(data) {
        if ( data && data.length > 1) {
            let minV = data[0];
            let maxV = data[0];
            for(let i = 0; i < data.length; i++ ) {
                if ( minV < data[i]) {
                    minV = data[i];
                }
                if ( maxV > data[i]) {
                    maxV = data[i];
                }
            }
            return { minV, maxV};            
        }
        return undefined;
    }
    static x(i, minMax ) {
        return (i*160/minMax.nsamples);
    }
    static y(v, minMax ) {
        return 90 - (((v-minMax.minV)*90)/(minMax.maxV-minMax.minV));
    }

}

class RelativeAngle {

    static display(v) {
        if ( v == undefined ) {
            return "--";
        }
        if(v < 0) {
            return `P${(-v*(180/Math.PI)).toFixed(0)}`;
        } else {
            return `S${(v*(180/Math.PI)).toFixed(0)}`;
        }
    }
    static tl = "";
    static tr = "";
    static withHistory = true;
    static units = "deg";
    static toDisplayUnits(v) {
        return (v*(180/Math.PI));
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        if ( minMax.minV > -60 && minMax.maxV < 60 ) {
            minMax.minV = -60;
            minMax.maxV = 60
        } else if ( minMax.minV > -90 && minMax.maxV < 90 ) {
            minMax.minV = -90;
            minMax.maxV = 90
        } else  {
            minMax.minV = -180;
            minMax.maxV = 180;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}

class RelativeBearing {

    static display(v) {
        if ( v == undefined ) {
            return "--";
        }
        if(v < 0) {
            return `W${(-v*(180/Math.PI)).toFixed(0)}`;
        } else {
            return `E${(v*(180/Math.PI)).toFixed(0)}`;
        }
    }
    static tl = "";
    static tr = "";
    static withHistory = true;
    static units = "deg";
    static toDisplayUnits(v) {
        return (v*(180/Math.PI));
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        if ( minMax.minV > -60 && minMax.maxV < 60 ) {
            minMax.minV = -60;
            minMax.maxV = 60
        } else if ( minMax.minV > -90 && minMax.maxV < 90 ) {
            minMax.minV = -90;
            minMax.maxV = 90
        } else  {
            minMax.minV = -180;
            minMax.maxV = 180;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}
class WindSpeed {
    static display(v) {
        if ( v == undefined ) {
            return "-.-";
        }
        return (v*1.9438452).toFixed(1);
    }
    static tl = "";
    static tr = "";
    static units = "kn";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v*1.9438452);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        minMax.minV = 0;

        if ( minMax.maxV < 10 ) {
            minMax.maxV = 10; 
        } else if ( minMax.maxV < 20 ) {
            minMax.maxV = 20;
        } else if ( minMax.maxV < 50 ) {
            minMax.maxV = 50;
        }
        minMax.nsamples = h.length;
        return minMax;
    }

}
class Speed {
    static display(v) {
        if ( v == undefined ) {
            return "-.-";
        }
        return (v*1.9438452).toFixed(1);
    }
    static tl = "";
    static tr = "";
    static units = "kn";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v*1.9438452);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        minMax.minV = 0;
        if ( minMax.maxV < 10 ) {
            minMax.maxV = 10; 
        } else if ( minMax.maxV < 20 ) {
            minMax.maxV = 20;
        } else if ( minMax.maxV < 50 ) {
            minMax.maxV = 50;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}



class Bearing {
    static display(v) {
        if ( v == undefined ) {
            return "-.-";
        }
        return (v*180/Math.PI).toFixed(0);
    }
    static tl = "";
    static tr = "";
    static units = "deg";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v*180/Math.PI);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        minMax.minV = 0;
        minMax.maxV = 360; 
        minMax.nsamples = h.length;
        return minMax;
    }
}

class Percent {
    static display(v) {
        if ( v == undefined ) {
            return "-.-";
        }
        return (v*100).toFixed(1);
    }
    static tl = "";
    static tr = "";
    static units = "%";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v*100);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        minMax.minV = 0;
        if ( minMax.maxV < 10 ) {
            minMax.maxV = 10; 
        } else if ( minMax.maxV < 20 ) {
            minMax.maxV = 20;
        } else if ( minMax.maxV < 50 ) {
            minMax.maxV = 50;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}

class TimeStamp {
    static tl = "";
    static tr = "";
    static units = "age s";
    static toDisplayUnits(v) {
        return ((Date.now()-v)/1000);
    }
    static display(v) { 
        if ( v == undefined ) {
            return "-.-";
        }
        return ((Date.now()-v)/1000).toFixed(0);
    }    
}
class DefaultDataType {
    static display(v) { 
        if ( v == undefined ) {
            return "-.-";
        }
        return (v).toFixed(1);
    }
}





class DataTypes {
    static dataTypes = {
            "aws": WindSpeed,
            "tws": WindSpeed,
            "awa": RelativeAngle,
            "twa": RelativeAngle,
            "roll": RelativeAngle,
            "leeway": RelativeAngle,
            "cogt": Bearing,
            "hdt": Bearing,
            "gwdt": Bearing,
            "gwdm": Bearing,
            "hdm": Bearing,
            "cogm": Bearing,
            "variation": RelativeBearing,
            "polarSpeed": Speed,
            "polarSpeedRatio": Percent,
            "polarVmg": Speed,
            "vmg": Speed,
            "targetVmg": Speed,
            "targetStw": Speed,
            "polarVmgRatio": Percent,
            "oppositeHeadingTrue": Bearing,
            "oppositeTrackTrue": Bearing,
            "oppositeTrackMagnetic": Bearing,
            "oppositeHeadingMagnetic": Bearing,
            "sog": Speed,
            "stw": Speed,
            "lastUpdate": TimeStamp,
            "lastChange": TimeStamp,
            "lastCalc": TimeStamp,
            "lastOutput": TimeStamp,

    };

    static getDataType(field) {
        if (DataTypes.dataTypes[field] ) {
            return DataTypes.dataTypes[field];
        }
        return DefaultDataType;
    }
}

export {DataTypes, DisplayUtils};
