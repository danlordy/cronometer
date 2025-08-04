// --- DOM Elements ---
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const timerSection = document.getElementById('timerSection');
const configSection = document.getElementById('configSection');
const historySection = document.getElementById('historySection');

const loginUsernameInput = document.getElementById('loginUsername');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const showRegisterButton = document.getElementById('showRegisterButton');
const loginError = document.getElementById('loginError');

const registerUsernameInput = document.getElementById('registerUsername');
const registerPasswordInput = document.getElementById('registerPassword');
const registerButton = document.getElementById('registerButton');
const backToLoginButton = document.getElementById('backToLoginButton');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');

const loggedInUsernameSpan = document.getElementById('loggedInUsername');
const timeDisplay = document.getElementById('timeDisplay');
const costDisplay = document.getElementById('costDisplay');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const configButton = document.getElementById('configButton');
const showHistoryButton = document.getElementById('showHistoryButton');
const logoutButton = document.getElementById('logoutButton');

const pricePerHourInput = document.getElementById('pricePerHour');
const currencySymbolInput = document.getElementById('currencySymbol');
const taskNameInput = document.getElementById('taskName');
const saveConfigButton = document.getElementById('saveConfigButton');
const backButton = document.getElementById('backButton');

const historyListDiv = document.getElementById('historyList');
const backFromHistoryButton = document.getElementById('backFromHistoryButton');
const exportCsvButton = document.getElementById('exportCsvButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const resetAppButton = document.getElementById('resetAppButton');


// --- Timer State ---
// Encapsulating timer-specific state
const timer = {
    interval: null,
    startTime: null, // Date object when timer is running
    elapsedTime: 0, // Milliseconds
    isRunning: false,
    sessionStartTime: null, // Tracks the start for the history entry
};


// --- UI Functions ---

function showSection(section) {
    [loginSection, registerSection, timerSection, configSection, historySection].forEach(s => s.classList.add('hidden'));
    section.classList.remove('hidden');
}

function showLogin() {
    showSection(loginSection);
    loginError.classList.add('hidden');
    registerSuccess.classList.add('hidden');
    loginUsernameInput.value = '';
    loginPasswordInput.value = '';
}

function showRegister() {
    showSection(registerSection);
    registerError.classList.add('hidden');
    registerSuccess.classList.add('hidden');
    registerUsernameInput.value = '';
    registerPasswordInput.value = '';
}

function showTimer() {
    showSection(timerSection);
    const currentUser = appLogic.getCurrentUser();
    if (currentUser) {
        loggedInUsernameSpan.textContent = currentUser.username;

        // Load user-specific timer state from the central appData
        const timerState = currentUser.currentTimerState || { elapsedTime: 0, isRunning: false, startTime: null };
        timer.elapsedTime = timerState.elapsedTime;
        timer.isRunning = timerState.isRunning;
        timer.startTime = timerState.startTime;
        timer.sessionStartTime = timerState.startTime; // Restore session start time

        updateTimeAndCostDisplay();

        if (timer.isRunning) {
            startButton.disabled = true;
            pauseButton.disabled = false;
            stopButton.disabled = false;
            if (timer.startTime instanceof Date) {
                startTimerInterval();
            } else {
                console.error("Invalid startTime loaded for running timer. Resetting.");
                handleStopTimerActions(); // Reset state
            }
        } else {
            startButton.disabled = false;
            pauseButton.disabled = true;
            stopButton.disabled = true;
             // If there's elapsed time, it means it's paused, so the stop button should be enabled.
            if (timer.elapsedTime > 0) {
                stopButton.disabled = false;
            }
        }
    } else {
        showLogin();
    }
}

function showConfig() {
    showSection(configSection);
    const currentUser = appLogic.getCurrentUser();
    if (currentUser && currentUser.settings) {
        pricePerHourInput.value = currentUser.settings.pricePerHour;
        currencySymbolInput.value = currentUser.settings.currencySymbol || '$';
    } else {
        pricePerHourInput.value = 100;
        currencySymbolInput.value = '$';
    }
}

function showHistory() {
    showSection(historySection);
    loadHistory();
}

// --- Timer Display and Calculation ---

function updateTimeAndCostDisplay() {
    const currentUser = appLogic.getCurrentUser();
    const pricePerHour = currentUser ? currentUser.settings.pricePerHour : 100;
    const currencySymbol = currentUser ? currentUser.settings.currencySymbol : '$';

    timeDisplay.textContent = appLogic.formatTime(timer.elapsedTime);
    const cost = appLogic.calculateCost(timer.elapsedTime, pricePerHour);
    costDisplay.textContent = `${currencySymbol}${cost.toFixed(2)}`;
}

// --- Timer Control Functions ---

function startTimerInterval() {
    clearInterval(timer.interval); // Prevent multiple intervals
    timer.interval = setInterval(() => {
        if (timer.startTime instanceof Date) {
            timer.elapsedTime = (Date.now() - timer.startTime.getTime());
            updateTimeAndCostDisplay();
        } else {
            console.error("Timer interval running with invalid startTime.");
            handleStopTimerActions();
        }
    }, 1000);
}

function stopTimerInterval() {
    clearInterval(timer.interval);
}

// Refactored function to handle common timer stopping actions
function handleStopTimerActions() {
    stopTimerInterval();
    timer.isRunning = false;
    timer.elapsedTime = 0;
    timer.startTime = null;
    timer.sessionStartTime = null;

    updateTimeAndCostDisplay();
    taskNameInput.value = '';

    startButton.disabled = false;
    pauseButton.disabled = true;
    stopButton.disabled = true;

    saveCurrentUserTimerState();
}

// --- State Saving ---

function saveCurrentUserTimerState() {
    const currentUser = appLogic.getCurrentUser();
    if (currentUser) {
        currentUser.currentTimerState = {
            elapsedTime: timer.elapsedTime,
            isRunning: timer.isRunning,
            startTime: timer.startTime
        };
        appLogic.saveAppData(localStorage);
    }
}


// --- History UI ---

function loadHistory() {
    const currentUser = appLogic.getCurrentUser();
    historyListDiv.innerHTML = '';

    if (currentUser && currentUser.history && currentUser.history.length > 0) {
        const sortedHistory = [...currentUser.history].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        sortedHistory.forEach(session => {
            const startTimeStr = new Date(session.startTime).toLocaleString();
            const endTimeStr = new Date(session.endTime).toLocaleString();
            const durationMinutes = (Number(session.duration) / 60000).toFixed(2);
            const symbol = currentUser.settings.currencySymbol || '$';
            const costStr = Number(session.cost).toFixed(2);

            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.innerHTML = `
                <p><strong>Inicio:</strong> ${startTimeStr}</p>
                <p><strong>Fin:</strong> ${endTimeStr}</p>
                <p><strong>Duración:</strong> ${durationMinutes} minutos</p>
                <p><strong>Tarea:</strong> ${session.taskName || 'Sin Título'}</p>
                <p><strong>Costo:</strong> ${symbol}${costStr}</p>
            `;
            historyListDiv.appendChild(historyItem);
        });
    } else {
        historyListDiv.innerHTML = '<p class="text-gray-400">No hay historial disponible.</p>';
    }
}


// --- Event Listeners ---

loginButton.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form submission
    const username = loginUsernameInput.value;
    const password = loginPasswordInput.value;
    const user = appLogic.findUser(username);

    if (user) {
        const hashedPassword = await appLogic.hashPassword(password);
        if (user.password === hashedPassword) {
            appLogic.setCurrentUser(username);
            appLogic.saveAppData(localStorage);
            showTimer();
        } else {
            loginError.classList.remove('hidden');
        }
    } else {
        loginError.classList.remove('hidden');
    }
});

showRegisterButton.addEventListener('click', () => {
    showRegister();
});

registerButton.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form submission
    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value;

    if (username && password) {
        const success = await appLogic.addUser(username, password);
        if (success) {
            appLogic.saveAppData(localStorage); // Save the new user
            registerSuccess.classList.remove('hidden');
            registerError.classList.add('hidden');
            registerUsernameInput.value = '';
            registerPasswordInput.value = '';
        } else {
            registerError.classList.remove('hidden');
            registerSuccess.classList.add('hidden');
        }
    } else {
        alert("Por favor, ingresa un nombre de usuario y contraseña.");
    }
});

backToLoginButton.addEventListener('click', () => {
    showLogin();
});

logoutButton.addEventListener('click', () => {
    saveCurrentUserTimerState(); // Save state before logging out

    stopTimerInterval();
    timer.isRunning = false;
    timer.elapsedTime = 0;
    timer.startTime = null;
    timer.sessionStartTime = null;

    appLogic.setCurrentUser(null);
    appLogic.saveAppData(localStorage);
    showLogin();
});

startButton.addEventListener('click', () => {
    if (!timer.isRunning) {
        if (timer.elapsedTime === 0) { // Starting new
            timer.startTime = new Date();
            timer.sessionStartTime = timer.startTime;
        } else { // Resuming from pause
            timer.startTime = new Date(Date.now() - timer.elapsedTime);
        }

        startTimerInterval();
        timer.isRunning = true;

        startButton.disabled = true;
        pauseButton.disabled = false;
        stopButton.disabled = false;

        saveCurrentUserTimerState();
    }
});

pauseButton.addEventListener('click', () => {
    if (timer.isRunning) {
        stopTimerInterval();
        timer.isRunning = false;

        startButton.disabled = false;
        pauseButton.disabled = true;

        saveCurrentUserTimerState();
    }
});

stopButton.addEventListener('click', () => {
    const currentUser = appLogic.getCurrentUser();
    if (currentUser && timer.elapsedTime > 0) {
        appLogic.addSessionToHistory(
            currentUser,
            timer.sessionStartTime,
            timer.elapsedTime,
            currentUser.settings.pricePerHour,
            taskNameInput.value.trim()
        );
        appLogic.saveAppData(localStorage);
    }
    handleStopTimerActions();
});

configButton.addEventListener('click', showConfig);

saveConfigButton.addEventListener('click', () => {
    const currentUser = appLogic.getCurrentUser();
    const newPrice = parseFloat(pricePerHourInput.value);
    const newSymbol = currencySymbolInput.value.trim();

    if (currentUser && !isNaN(newPrice) && newPrice >= 0) {
        currentUser.settings.pricePerHour = newPrice;
        currentUser.settings.currencySymbol = newSymbol || '$';
        appLogic.saveAppData(localStorage);
        updateTimeAndCostDisplay(); // Update display with new values
        showTimer();
    } else {
        alert("Por favor, ingresa un precio por hora válido.");
    }
});

backButton.addEventListener('click', showTimer);
showHistoryButton.addEventListener('click', showHistory);
backFromHistoryButton.addEventListener('click', showTimer);

// --- Data Clearing and Export ---

function exportHistoryToCSV() {
    const currentUser = appLogic.getCurrentUser();
    if (!currentUser || !currentUser.history || currentUser.history.length === 0) {
        alert("No hay historial para exportar.");
        return;
    }

    const headers = ["Fecha Inicio", "Hora Inicio", "Fecha Fin", "Hora Fin", "Duración (HH:MM:SS)", "Duración (Minutos)", "Tarea/Proyecto", "Costo", "Moneda"];
    const symbol = currentUser.settings.currencySymbol || '$';

    const escapeCsvCell = (cell) => {
        if (cell == null) return '';
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = [headers.join(',')];
    currentUser.history.forEach(session => {
        const startDate = new Date(session.startTime).toLocaleDateString('sv-SE');
        const startTimeStr = new Date(session.startTime).toLocaleTimeString('en-GB');
        const endDate = new Date(session.endTime).toLocaleDateString('sv-SE');
        const endTimeStr = new Date(session.endTime).toLocaleTimeString('en-GB');
        const durationHHMMSS = appLogic.formatTime(session.duration);
        const durationMinutes = (Number(session.duration) / 60000).toFixed(2);
        const taskName = session.taskName || "Sin Título";
        const cost = Number(session.cost).toFixed(2);

        const row = [startDate, startTimeStr, endDate, endTimeStr, durationHHMMSS, durationMinutes, taskName, cost, symbol].map(escapeCsvCell);
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "cronometer_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


function clearCurrentUserHistory() {
    if (confirm("¿Estás seguro de que quieres limpiar TODO tu historial de sesiones? Esta acción no se puede deshacer.")) {
        const currentUser = appLogic.getCurrentUser();
        if (currentUser) {
            currentUser.history = [];
            appLogic.saveAppData(localStorage);
            alert("Tu historial de sesiones ha sido limpiado.");
            if (!historySection.classList.contains('hidden')) {
                loadHistory();
            }
        }
    }
}

function resetApplication() {
    if (confirm("¡ADVERTENCIA! ¿Estás ABSOLUTAMENTE seguro de que quieres reiniciar la aplicación? TODOS los usuarios y datos serán eliminados permanentemente.")) {
        localStorage.removeItem(appLogic.STORAGE_KEY_APP_DATA);
        window.location.reload();
    }
}

if (exportCsvButton) exportCsvButton.addEventListener('click', exportHistoryToCSV);
if (clearHistoryButton) clearHistoryButton.addEventListener('click', clearCurrentUserHistory);
if (resetAppButton) resetAppButton.addEventListener('click', resetApplication);


// --- Initial Load ---
appLogic.loadAppData(localStorage);

if (appLogic.getCurrentUser()) {
    showTimer();
} else {
    showLogin();
}

window.addEventListener('pagehide', saveCurrentUserTimerState);
window.addEventListener('beforeunload', saveCurrentUserTimerState);
