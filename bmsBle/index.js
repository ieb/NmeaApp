/*jshint node:false */
"use strict";


window.addEventListener("load", () => {
    const bleReader = new JDBBMSReader();
    document.getElementById('connect').addEventListener("click", bleReader.pairBms);


    const setInnerHtmlById = (id, value) => {
        const el = document.getElementById(id);
        if ( el ) {
            el.innerHTML = value;
        } else {
            console.log("ID Not found ",id)
        }
    };
    const setClass = (id, value, classOn, classOff) => {
        const el = document.getElementById(id);
        if ( el ) {
            const classes = el.getAttribute("class") || "";
            const classList  = classes.split(" ")
                .filter((className) => { return (className !== classOn && className != classOff); });
            classList.push(value?classOn:classOff);
            el.setAttribute("class",classList.join(" "));
        } else {
            console.log("ID Not found ",id)
        }
    };

    bleReader.on('connected', (connected) => {
        setClass('connect',connected,'hidden','');
        setClass('disconnect',connected,'','hidden');
    });

    bleReader.on("statusUpdate", (statusUpdate) => {
        setInnerHtmlById("status.voltage", statusUpdate.voltage.toFixed(2));
        setInnerHtmlById("status.voltage", statusUpdate.voltage.toFixed(2));
        setInnerHtmlById("status.current", statusUpdate.current.toFixed(1));
        setInnerHtmlById("status.capacity.stateOfCharge", statusUpdate.capacity.stateOfCharge.toFixed(0));
        setInnerHtmlById("status.packBalCap", statusUpdate.packBalCap.toFixed(0));
        setInnerHtmlById("status.capacity.fullCapacity", statusUpdate.capacity.fullCapacity.toFixed(0));
        setClass("status.charging", statusUpdate.FETStatus.charging==1, "enabled", "disabled");
        setClass("status.discharging", statusUpdate.FETStatus.discharging==1, "enabled", "disabled");
        setInnerHtmlById("status.chargeCycles", statusUpdate.chargeCycles);
        setInnerHtmlById("status.productionDate", statusUpdate.productionDate.toDateString());
        setInnerHtmlById("status.bmsSWVersion", statusUpdate.bmsSWVersion);
        setInnerHtmlById("status.numberOfCells", statusUpdate.numberOfCells.toFixed(0));
        setInnerHtmlById("status.tempSensorCount", statusUpdate.tempSensorCount.toFixed(0));
        setInnerHtmlById("status.chemistry", statusUpdate.chemistry);
        for (var i = 0; i < statusUpdate.balanceActive.length; i++) {
            setClass('status.balanceActive'+i,statusUpdate.balanceActive[i]==1, "enabled", "disabled");
        }
        for (var i = 0; i < statusUpdate.tempSensorValues.length; i++) {
            setInnerHtmlById('status.tempSensorValues'+i,statusUpdate.tempSensorValues[i].toFixed(1));
        }
        for( var k in statusUpdate.currentErrors) {
            setClass('status.errors.'+k, statusUpdate.currentErrors[k]==1, "enabled", "disabled");
        }
        setInnerHtmlById("status.lastUpdate", (new Date()).toString());

    });
    bleReader.on("cellUpdate", (cellUpdate) => {
        var cellMax = cellUpdate.cellMv[0];
        var cellMin = cellUpdate.cellMv[0];
        for (var i = 0; i < cellUpdate.cellMv.length; i++) {
            setInnerHtmlById('cell.voltage'+i,(0.001*cellUpdate.cellMv[i]).toFixed(3));
            cellMax = Math.max(cellMax, cellUpdate.cellMv[i]);
            cellMin = Math.min(cellMin, cellUpdate.cellMv[i]);
        }
        const range = cellMax - cellMin;
        setInnerHtmlById('cell.range', `${(0.001*cellMin).toFixed(3)} - ${(0.001*cellMax).toFixed(3)}`);
        setInnerHtmlById('cell.diff', (0.001*range).toFixed(3));
        setInnerHtmlById("status.lastUpdate", (new Date()).toString());

    });

});



