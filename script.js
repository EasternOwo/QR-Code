// QR Code library: https://github.com/soldair/node-qrcode

const textField = document.getElementById("text-field");

let currentLevel = 'L';
const ecValText = document.getElementById("ec-value-text");
const ecSlider = document.getElementById("ec-slider");
const ecSliderText = document.getElementById("ec-slider-text");

const sizeValText = document.getElementById("size-value-text");
const sizeSlider = document.getElementById("size-slider");
const sizeSliderText = document.getElementById("size-slider-text");

const colorPicker = document.getElementById("picker");
const colorPickerWrapper = document.getElementById("picker-wrapper");
const hexField = document.getElementById("hex-field");

const codeImg = document.getElementById("qrcode");
const codeBg = document.getElementById("qrcode-bg");

const dict = {0: "L", 1: "M", 2: "Q", 3: "H"};
const dict2 = {0: 7, 1: 15, 2: 25, 3: 30};

// let ecRecord = 1;

function setErrorCorrectionLevel() {
    
    const val = Math.round(ecSlider.valueAsNumber);
    ecSlider.value = val;

    const newLevel = dict[val];

    currentLevel = newLevel;
    ecValText.textContent = newLevel;
    ecSliderText.textContent = "圖形毀損 " + dict2[val] + "% 時仍可掃描";
    updateCode();
}

function setSize() {
    const val = sizeSlider.valueAsNumber;
    sizeValText.textContent = val;
    sizeSliderText.textContent = "一格對應 " + val + " × " + val + " 像素";
}

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

let isUpdating = false;
setErrorCorrectionLevel();
setSize();

let qrData = null;

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
        // Get the size of the QR code
        // qrData = await QRCode.create(
        //     textField.value, 
        //     opts
        // );
        // console.log(qrData.modules.size);

        const dataURL = await 
            QRCode.toDataURL(
            textField.value, 
            opts
        );
        codeImg.src = dataURL;
    } catch {
        if (bri > 0.75) {
            codeImg.src = "images/blank_white.png";
        } else {
            codeImg.src = "images/blank.png";
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
        scale: sizeSlider.valueAsNumber,
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
        scale: sizeSlider.valueAsNumber,
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