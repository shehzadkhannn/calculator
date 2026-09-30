const display = document.querySelector('#display');
const history = document.querySelector('#history');
const keys = document.querySelector('.keypad');

let currentValue = '0';
let storedValue = null;
let pendingOperator = null;
let shouldResetDisplay = false;

function updateDisplay() {
	display.textContent = currentValue;
	history.textContent = storedValue !== null && pendingOperator
		? `${formatNumber(storedValue)} ${pendingOperator}`
		: '';
}

function formatNumber(value) {
	return Number(value).toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function inputDigit(digit) {
	if (currentValue === 'Error' || shouldResetDisplay) {
		currentValue = digit;
		shouldResetDisplay = false;
	} else {
		currentValue = currentValue === '0' ? digit : currentValue + digit;
	}
	updateDisplay();
}

function inputDecimal() {
	if (currentValue === 'Error' || shouldResetDisplay) {
		currentValue = '0.';
		shouldResetDisplay = false;
	} else if (!currentValue.includes('.')) {
		currentValue += '.';
	}
	updateDisplay();
}

function calculate(left, operator, right) {
	const first = Number(left);
	const second = Number(right);

	if (operator === '+') return first + second;
	if (operator === '−') return first - second;
	if (operator === '×') return first * second;
	if (operator === '÷') return second === 0 ? null : first / second;
	return second;
}

function chooseOperator(operator) {
	if (currentValue === 'Error') return;

	if (pendingOperator && !shouldResetDisplay) {
		resolveCalculation();
	}

	storedValue = Number(currentValue);
	pendingOperator = operator;
	shouldResetDisplay = true;
	updateDisplay();
}

function resolveCalculation() {
	if (storedValue === null || !pendingOperator) return;

	const result = calculate(storedValue, pendingOperator, currentValue);
	currentValue = result === null || !Number.isFinite(result) ? 'Error' : String(result);
	storedValue = null;
	pendingOperator = null;
	shouldResetDisplay = true;
	updateDisplay();
}

function clearCalculator() {
	currentValue = '0';
	storedValue = null;
	pendingOperator = null;
	shouldResetDisplay = false;
	updateDisplay();
}

function backspace() {
	if (shouldResetDisplay || currentValue === 'Error') return;
	currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
	if (currentValue === '-') currentValue = '0';
	updateDisplay();
}

function toggleSign() {
	if (currentValue !== '0' && currentValue !== 'Error') {
		currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`;
		updateDisplay();
	}
}

function applyPercent() {
	if (currentValue !== 'Error') {
		currentValue = String(Number(currentValue) / 100);
		updateDisplay();
	}
}

function handleAction(action) {
	if (action === 'clear') clearCalculator();
	if (action === 'backspace') backspace();
	if (action === 'decimal') inputDecimal();
	if (action === 'equals') resolveCalculation();
	if (action === 'sign') toggleSign();
	if (action === 'percent') applyPercent();
}

keys.addEventListener('click', (event) => {
	const button = event.target.closest('button');
	if (!button) return;

	if (button.dataset.value && /^\d$/.test(button.dataset.value)) inputDigit(button.dataset.value);
	else if (button.dataset.value) chooseOperator(button.dataset.value);
	else handleAction(button.dataset.action);
});

document.addEventListener('keydown', (event) => {
	if (/^\d$/.test(event.key)) inputDigit(event.key);
	else if (event.key === '.') inputDecimal();
	else if (event.key === 'Enter' || event.key === '=') resolveCalculation();
	else if (event.key === 'Escape') clearCalculator();
	else if (event.key === 'Backspace') backspace();
	else if (['+', '-', '*', '/'].includes(event.key)) {
		const operators = { '+': '+', '-': '−', '*': '×', '/': '÷' };
		chooseOperator(operators[event.key]);
	} else return;

	event.preventDefault();
});

updateDisplay();
