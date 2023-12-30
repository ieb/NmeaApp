

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
    static cssClass(v) {
        if ( v == undefined ) {
            return "undef";
        }
        if(v < 0) {
            return "port";
        } else {
            return "starboard";
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
        if ( v == undefined || v === -1E9) {
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
        if ( v == undefined || v === -1E9 ) {
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

class Distance {
    static display(v) {
        if ( v == undefined || v === -1E9) {
            return "-.-";
        }
        return (v*0.000539957).toFixed(2);
    }
    static tl = "";
    static tr = "";
    static units = "Nm";
    static withHistory = false;
    static toDisplayUnits(v) {
        return (v*0.000539957);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}

class AtmosphericPressure {
    static display(v) {
        if ( v == undefined || v === -1E9) {
            return "-.-";
        }
        // convery Pascale or mbar
        return (v*0.01).toFixed(0);
    }
    static tl = "";
    static tr = "";
    static units = "mBar";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v*0.01);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }

        minMax.nsamples = h.length;
        return minMax;
    }
}




class Bearing {
    static display(v) {
        if ( v == undefined || v === -1E9) {
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

class Latitude {
    static display(v) {
        if ( v == undefined || v === -1E9) {
            return "-.-";
        }

        let ns = 'N';
        if ( v < 0 ) {
            ns = 'S';
            v = -v;
        }
        const dd = Math.trunc(v);
        const mm = (v - dd)*60;  
        return`${("000"+(dd.toFixed(0))).slice(-2)}°${("00"+(mm.toFixed(3))).slice(-6)}′${ns}`;
    }
    
    static tl = "";
    static tr = "";
    static units = "lat";
    static withHistory = false;
    static toDisplayUnits(v) {
        return (v);
    }
}

class Longitude {
    static display(v) {
        if ( v == undefined || v === -1E9) {
            return "-.-";
        }

        let ew = 'E';
        if ( v < 0 ) {
            ew = 'W';
            v = -v;
        }
        const dd = Math.trunc(v);
        const mm = (v - dd)*60;
        return`${("000"+(dd.toFixed(0))).slice(-3)}°${("00"+(mm.toFixed(3))).slice(-6)}′${ew}`;
    }
    
    static tl = "";
    static tr = "";
    static units = "lon";
    static withHistory = false;
    static toDisplayUnits(v) {
        return (v);
    }
}




class Percent {
    static display(v) {
        if ( v == undefined  || v === -1E9) {
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

class Ratio {
    static display(v) {
        if ( v == undefined || v === -1E9 ) {
            return "-.-";
        }
        return (v).toFixed(1);
    }
    static tl = "";
    static tr = "";
    static units = "%";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v);
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

class Capacity {
    static display(v) {
        if ( v == undefined || v === -1E9 ) {
            return "-.-";
        }
        return (v).toFixed(1);
    }
    static tl = "";
    static tr = "";
    static units = "l";
    static withHistory = false;
    static toDisplayUnits(v) {
        return (v);
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

class Depth {
    static display(v) {
        if ( v == undefined || v == -1E9) {
            return "-.-";
        }
        return (v).toFixed(1);
    }
    static tl = "";
    static tr = "";
    static units = "m";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v);
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
        } else if ( minMax.maxV < 200 ) {
            minMax.maxV = 200;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}

class Rpm {
    static display(v) {
        if ( v == undefined || v === -1E9) {
            return "-.-";
        }
        return (v).toFixed(0);
    }
    static tl = "";
    static tr = "";
    static units = "rpm";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        minMax.minV = 0;
        if ( minMax.maxV < 1000 ) {
            minMax.maxV = 1000; 
        } else if ( minMax.maxV < 2000 ) {
            minMax.maxV = 2000;
        } else if ( minMax.maxV < 5000 ) {
            minMax.maxV = 5000;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}
class Temperature {
    static display(v) {
        if ( v == undefined || v === -1E9 ) {
            return "-.-";
        }
        return (v-237.15).toFixed(1);
    }
    static tl = "";
    static tr = "";
    static units = "C";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v-237.15);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}

class Voltage {
    static display(v) {
        if ( v == undefined || v == -1E9) {
            return "-.-";
        }
        return (v).toFixed(2);
    }
    static tl = "";
    static tr = "";
    static units = "V";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
        }
        minMax.nsamples = h.length;
        return minMax;
    }
}
class Current {
    static display(v) {
        if ( v == undefined || v == -1E9) {
            return "-.-";
        }
        return (v).toFixed(1);
    }
    static tl = "";
    static tr = "";
    static units = "A";
    static withHistory = true;
    static toDisplayUnits(v) {
        return (v);
    }
    static range(h) {
        const minMax = DisplayUtils.calMinMax(h);
        if (!minMax) {
            return undefined;
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
        if ( v.name !== undefined ) {
            return v.name;
        }
        try {
            return (v).toFixed(1);
        } catch(e) {
            return v;
        }
    }
}





class DataTypes {
    static dataTypes = {
            "aws": WindSpeed,
            "tws": WindSpeed,
            "awa": RelativeAngle,
            "twa": RelativeAngle,
            "roll": RelativeAngle,
            "yaw": RelativeAngle,
            "pitch": RelativeAngle,
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
            "targetTwa": RelativeAngle,
            "targetAwa": RelativeAngle,
            "targetAws": Speed,
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
            "deviation": RelativeBearing,
            "log": Distance,
            "tripLog": Distance,
            "atmosphericPressure": AtmosphericPressure,
            "latitude": Latitude,
            "longitude": Longitude,
            "fuelLevel": Ratio,
            "fuelCapacity": Capacity,
            "dbt": Depth,
            "depthOffset": Depth,
            "rudderPosition": RelativeAngle,
            "engineSpeed": Rpm,
            "engineCoolantTemperature": Temperature,
            "temperature": Temperature,
            "alternatorVoltage": Voltage,
            "voltage": Voltage,
            "current": Current,
    };
    static displayNames = {
        engineCoolantTemperature: "coolant",
    };

    static getDisplayName(field) {
        if (DataTypes.displayNames[field]) {
            return DataTypes.displayNames[field];
        }
        return field;
    }

    static getDataType(field) {
        const fieldKey = field.split("_")[0];
        if (DataTypes.dataTypes[fieldKey] ) {
            return DataTypes.dataTypes[fieldKey];
        }
        return DefaultDataType;
    }
}

export {DataTypes, DisplayUtils};
