const buttonL = document.getElementById("button-l");
const buttonM = document.getElementById("button-m");
const buttonQ = document.getElementById("button-q");
const buttonH = document.getElementById("button-h");

const ecButtons = [buttonL, buttonQ, buttonM, buttonH];

const textField = document.getElementById("text-field");
const image = document.getElementById("qrcode");
const colorPicker = document.getElementById("picker");
const colorPickerWrapper = document.getElementById("picker-wrapper");
const hexField = document.getElementById("hex-field");

const codeBg = document.getElementById("qrcode-bg");

function setErrorCorrectionLevel(level) {
    ecButtons.forEach(ele => {
        ele.style.backgroundColor = "#66a4d9";
    });

    const selectedButton = document.getElementById("button-" + level.toLowerCase());
    selectedButton.style.background = '#436f96';
    currentLevel = level;
    updateCode();
}

// function setPlaceholderQRCode() {}

function setColor(color) {
    colorPicker.value = color;
    colorPickerWrapper.style.backgroundColor = color;
    hexField.value = colorPicker.value.toUpperCase();

    updateCode();
}

function setColorFromPicker() {
    let color = colorPicker.value;
    setColor(color);
}

function setColorFromHex() {
    let re1 = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    let re2 = /([0-9a-f]{3}|[0-9a-f]{6})$/i;
    
    let color = hexField.value;

    if (re1.test(color)) {
        setColor(color);
    } else if (re2.test(color)) {
        setColor('#' + color);
    } else {
        setColor('#000000');
    }
}

function calculateBrightness(colorHex) {
    const hexInt = parseInt(colorHex.replace("#", ''), 16);
    const r = (hexInt >> 16) % 256;
    const g = (hexInt >> 8) % 256;
    const b = hexInt % 256;
    const bri = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 256;

    return bri
}

let currentLevel = "L";
setErrorCorrectionLevel(currentLevel);

let isUpdating = false;

async function updateCode() {
    if (isUpdating) return;

    isUpdating = true;

    let opts = {
        errorCorrectionLevel: currentLevel,
        quality: 0.3,
        margin: 0,
        scale: 10,
        color: {
            dark: colorPicker.value + "FF",
            light: "#00000000"
        }
    };

    let bri = calculateBrightness(colorPicker.value);

    try {
        const dataURL = await 
            QRCode.toDataURL(
            textField.value, 
            opts
        );
        image.src = dataURL;
    } catch {
        if (bri > 0.75) {
            image.src = "images/blank_white.png";
        } else {
            image.src = "images/blank.png";
        }
    } finally {
        if (bri > 0.75) {
            codeBg.style.backgroundColor = "#222222";
        } else {
            codeBg.style.backgroundColor = "white";
        }

        isUpdating = false;
    }
}

function downloadPNG() {
    if (!textField.value) return;

    let opts = {
        type: 'png',
        errorCorrectionLevel: currentLevel,
        quality: 0.3,
        margin: 0,
        scale: 10,
        color: {
            dark: colorPicker.value + "FF",
            light:"#00000000"
        }
    };

    QRCode.toDataURL(
        textField.value, 
        opts
    ).then(dataURL => {
        var link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    });
}

function downloadSVG() {
    if (!textField.value) return;

    let opts = {
        type: 'svg',
        errorCorrectionLevel: currentLevel,
        quality: 0.3,
        margin: 0,
        scale: 10,
        color: {
            dark: colorPicker.value + "FF",
            light:"#00000000"
        }
    };

    QRCode.toString(
        textField.value, 
        opts
    ).then(text => {
        const dataURL = `data:text/plain;base64,${btoa(text)}`;

        var link = document.createElement("a");
        link.download = "qrcode.svg";
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    });
}