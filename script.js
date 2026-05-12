// QR Code library: https://github.com/soldair/node-qrcode

const textField = document.getElementById("text-field");

let currentLevel = 'L';
const ecButtonL = document.getElementById("ec-button-l");
const ecButtonM = document.getElementById("ec-button-m");
const ecButtonQ = document.getElementById("ec-button-q");
const ecButtonH = document.getElementById("ec-button-h");
const ecButtons = [ecButtonL, ecButtonM, ecButtonQ, ecButtonH];

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

const testBlock = document.getElementById("test-block");

const dict = {0: "L", 1: "M", 2: "Q", 3: "H"};
const dict2 = {0: 7, 1: 15, 2: 25, 3: 30};

function setECLevel(level) {
    ecButtons.forEach(btn => {
        btn.classList.remove("radio-button-active");
    });

    ecButtons[level].classList.add("radio-button-active");

    ecSliderText.textContent = "圖形被遮擋 " + dict2[level] + "% 時仍可讀取";

    currentLevel = dict[level];
    updateCode();
}

function setErrorCorrectionLevel() {
    const val = Math.round(ecSlider.valueAsNumber);
    setElasticSliderPosition()

    const newLevel = dict[val];

    currentLevel = newLevel;
    ecValText.textContent = newLevel;
    ecSliderText.textContent = "圖形被遮擋 " + dict2[val] + "% 時仍可讀取";
    updateCode();
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
    const re1 = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    const re2 = /^([0-9a-f]{6}|[0-9a-f]{3})$/i;

    const color = hexField.value.trim();

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
setECLevel(0);

let qrData = null;

async function updateCode() {
    if (isUpdating) return;

    isUpdating = true;

    let opts = {
        errorCorrectionLevel: currentLevel,
        quality: 0.3,
        margin: 0,
        scale: 15,
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
        scale: 15,
        color: {
            dark: colorPicker.value + "FF",
            light:"#00000000"
        }
    };

    QRCode.toDataURL(
        textField.value, 
        opts
    ).then(dataURL => {
        fetch(dataURL)
            .then(res => { return res.blob() })
            .then(blob => {
                const url = URL.createObjectURL(blob);

                console.log(url);

                const link = document.createElement("a");
                link.download = "qrcode.png";
                link.href = url;
                
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            })
    });
}

function downloadSVG() {
    if (!textField.value) return;

    let opts = {
        type: 'svg',
        errorCorrectionLevel: currentLevel,
        quality: 0.3,
        margin: 0,
        scale: 15,
        color: {
            dark: colorPicker.value + "FF",
            light: "#00000000"
        }
    };

    QRCode.toString(textField.value, opts).then(svgString => {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        console.log(url);

        const link = document.createElement("a");
        link.download = "qrcode.svg";
        link.href = url;
        
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}