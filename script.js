// QR Code library: https://github.com/soldair/node-qrcode

const textField = document.getElementById("text-field");

let currentLevel = 'L';
const ecButtonL = document.getElementById("ec-button-l");
const ecButtonM = document.getElementById("ec-button-m");
const ecButtonQ = document.getElementById("ec-button-q");
const ecButtonH = document.getElementById("ec-button-h");
const ecButtons = [ecButtonL, ecButtonM, ecButtonQ, ecButtonH];

const ecSliderText = document.getElementById("ec-slider-text");

const sizeValText = document.getElementById("size-value-text");
const sizeSlider = document.getElementById("size-slider");
const sizeSliderText = document.getElementById("size-slider-text");

const codeImg = document.getElementById("qrcode");
const codeBg = document.getElementById("qrcode-bg");

const testBlock = document.getElementById("test-block");

const dict = {0: "L", 1: "M", 2: "Q", 3: "H"};
const dict2 = {0: 7, 1: 15, 2: 25, 3: 30};

const labels = document.querySelectorAll('.has-label');

labels.forEach(label => {
    label.addEventListener('click', e => {
        e.stopPropagation() // stops document from detecting click and closing the label immediately
        label.classList.toggle('.active');
    })
});

document.addEventListener('click', e => {
    labels.forEach(label => {
        label.classList.remove('.active');
    });
});

function setECLevel(level) {
    ecButtons.forEach(btn => {
        btn.classList.remove("radio-button-active");
    });

    ecButtons[level].classList.add("radio-button-active");

    ecSliderText.textContent = "圖形被遮擋 " + dict2[level] + "% 時仍可讀取";

    currentLevel = dict[level];
    updateCode();
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
            dark: colorPicker.color + "FF",
            light: "#00000000"
        }
    };

    let bri = calculateBrightness(colorPicker.color);

    try {
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

class ColorPicker {
    constructor(color, id, callback) {
        this.defaultColor = color;
        this.picker = document.getElementById(`${id}-picker`);
        this.wrapper = document.getElementById(`${id}-picker-wrapper`);
        this.textField = document.getElementById(`${id}-picker-text-field`);
        this.callback = callback;
    }

    get color() {
        return this.picker.value;
    }

    normalize(color) {
        const re1 = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        const re2 = /^([0-9a-f]{6}|[0-9a-f]{3})$/i;
        const c1 = color.trim();

        if (re1.test(c1))
            return c1;
        else if (re2.test(c1))
            return '#' + c1;
        return null;
    }

    setColor(color) {
        const c = this.normalize(color);
        if (c === null) {
            this.textField.value = this.picker.value.toUpperCase();
            return;
        }

        this.picker.value = c;
        this.wrapper.style.backgroundColor = c;
        this.textField.value = this.picker.value.toUpperCase();
        this.callback(c);
    }

    init() {
        this.picker.addEventListener("change", event => {
            this.setColor(this.picker.value);
        });

        this.textField.addEventListener("change", event => {
            this.setColor(this.textField.value);
        });

        this.setColor(this.defaultColor);
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
            dark: colorPicker.color + "FF",
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
            dark: colorPicker.color + "FF",
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

let colorPicker = new ColorPicker("#000000", "qr-color", updateCode);
colorPicker.init();

setECLevel(0);