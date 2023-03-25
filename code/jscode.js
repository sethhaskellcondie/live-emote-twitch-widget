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
let fieldData;
const MAX_TRIGGERS = 90;

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    for (let i = 0; i <= MAX_TRIGGERS; i++) {
        let fieldTrigger = fieldData[`trigger${i}`];
        let fieldImage = fieldData[`image${i}`];
        let fieldSound = fieldData[`sound${i}`];

        if (fieldTrigger == "" || fieldTrigger === undefined)
            continue;

        let inputTriggers = fieldTrigger.split(", ");
        for (let inputTrigger of inputTriggers) {
            console.log(inputTrigger);
            let tempArray = [];
            tempArray.push({
                file:fieldData[`image${i}`],
                sound:fieldData[`sound${i}`]
            });
            //if the object has no array then add it to the triggerObject
            //else the object exists add another entry to it
            if (userConfig.triggers[inputTrigger] === undefined) {
                userConfig.triggers[inputTrigger] = [tempArray];
            } else {
                userConfig.triggers[inputTrigger].push(tempArray);
            }
        }
    }
});


window.addEventListener('onEventReceived', function (obj) {
    // console.log(obj);
    // console.log(userConfig);

    //validate the object
    //make sure that the event is a chat command
    if ((obj.detail.listener !== 'message'))
        return;

    //parse the input into an array
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
        //check for case sensivitity
        let caseSensitive = userConfig.caseSensitive;
        if (caseSensitive == "off") {
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

    //include the timers for the cooldown and the reset
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