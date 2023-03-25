// -- KEYWORDS WIDGET CODE --
let userConfig = {
    commandCooldown: "{{commandCooldown}}",
    resetCooldown: "{{resetCooldown}}",
    caseSensitive: "{{caseSensitive}}",
    defaultTrigger:{
        file: "{{imageDefault}}",
        trigger: "{{triggerDefault}}"
    },
    triggers: {}
};

let coolingDown = false;
let resetSet;
const MAX_TRIGGERS = 90;

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    for (let i = 0; i <= MAX_TRIGGERS; i++) {
        let fieldTrigger = fieldData[`trigger${i}`];

        if (fieldTrigger === "" || fieldTrigger === undefined)
            continue;

        let inputTriggers = fieldTrigger.split(", ");
        for (let inputTrigger of inputTriggers) {
            let tempArray = [];
            tempArray.push({
                file:fieldData[`image${i}`],
                sound:fieldData[`sound${i}`]
            });
            if (userConfig.triggers[inputTrigger] === undefined) {
                userConfig.triggers[inputTrigger] = [tempArray];
            } else {
                userConfig.triggers[inputTrigger].push(tempArray);
            }
        }
    }
});


window.addEventListener('onEventReceived', function (obj) {
    if ((obj.detail.listener !== 'message'))
        return;

    let data = obj.detail.event.data;
    let input = data.text;
    //remove all non letters
    input = input.replace(/[\W_]+/g," ");
    if (input === " ") {
        // console.log('only symbols');
        return;
    }

    input = input.trim();
    let words = input.split(" ");
    let triggerArray;
    for (let word of words) {
        word = word.trim();
        let caseSensitive = userConfig.caseSensitive;
        if (caseSensitive === "off") {
            word = word.toLowerCase();
        }

        triggerArray = userConfig.triggers[word];
        if (triggerArray !== undefined) {
            break;
        }
    }

    //none of the words were a trigger
    if (triggerArray === undefined)
        return;

    let commandCooldown = userConfig.commandCooldown;
    let resetCooldown = userConfig.resetCooldown;

    if (coolingDown) {
        //console.log('still cooling down from the last image update');
        return;
    }

    //get a random array from the triggerArray
    let index = Math.floor(Math.random() * triggerArray.length);
    let fieldsArray = triggerArray[index][0];

    //update the frame with the new picture
    let imageFile = fieldsArray['file'];
    let imageSound = fieldsArray['sound'];
    updateImage(imageFile, imageSound);

    if (commandCooldown > 0) {
        coolingDown = true;
        setTimeout(function(){ coolingDown = false;}, commandCooldown * 1000);
    }
    if (resetCooldown > 0) {
        clearTimeout(resetSet);
        resetSet = setTimeout(updateToDefault, resetCooldown * 1000);
    }
});

function updateImage (file, sound) {
    document.getElementById('img_display').src = file;
    document.getElementById('img_display').alt = "broken image...";
    let audio = new Audio(sound);
    audio.play();
}

function updateToDefault() {
    document.getElementById('img_display').src = userConfig.defaultTrigger.file;
    document.getElementById('img_display').alt = "default image is broken...";
}