const display = document.getElementById('display');

function appendNumber(input) {
    if (display.innerText === '0' && input !== '.') {
        display.innerText = input;
    } else {
        display.innerText += input;
    }
}

function clearDisplay() {
    display.innerText = '0';
}

function deleteLast() {
    if (display.innerText.length === 1 || display.innerText === 'Erro') {
        display.innerText = '0';
    } else {
        display.innerText = display.innerText.slice(0, -1);
    }
}

function calculate() {
    try {
        display.innerText = eval(display.innerText);
    } catch (error) {
        display.innerText = 'Erro';
        setTimeout(clearDisplay, 1500);
    }
}