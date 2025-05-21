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
const saveConfigButton = document.getElementById('saveConfigButton');
const backButton = document.getElementById('backButton');

const historyListDiv = document.getElementById('historyList');
const backFromHistoryButton = document.getElementById('backFromHistoryButton');

// --- Timer Variables ---
let timerInterval;
let startTime; // Will be a Date object when timer is running
let elapsedTime = 0; // in milliseconds
let isRunning = false;
let pricePerMinute = 0; // Calculated based on price per hour
let currentSessionStartTime = null; // To track the start time of the current session (Date object)

// --- Local Storage Key ---
const STORAGE_KEY_APP_DATA = 'costTimerAppData';

// --- App Data Structure ---
let appData = {
    users: [],
    currentUser: null // Stores the username of the logged-in user
};

// --- Local Storage Functions ---

// Hashing function using SubtleCrypto
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}

// Loads data from localStorage
function loadAppData() {
    const savedData = localStorage.getItem(STORAGE_KEY_APP_DATA);
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Ensure appData structure matches, handle potential missing properties
        appData.users = parsedData.users || [];
        appData.currentUser = parsedData.currentUser || null;

        // Need to parse dates from history strings back to Date objects
        appData.users.forEach(user => {
            // Ensure user has a history array
            user.history = user.history || [];
            user.history.forEach(session => {
                // Check if startTime and endTime exist and are strings before parsing
                if (typeof session.startTime === 'string') {
                    session.startTime = new Date(session.startTime);
                }
                if (typeof session.endTime === 'string') {
                    session.endTime = new Date(session.endTime);
                }
                // Ensure duration and cost are numbers
                session.duration = Number(session.duration) || 0;
                session.cost = Number(session.cost) || 0;
            });

            // Ensure user has currentTimerState and parse timer start time if it exists
            user.currentTimerState = user.currentTimerState || { elapsedTime: 0, isRunning: false, startTime: null };
            if (typeof user.currentTimerState.startTime === 'string') {
                user.currentTimerState.startTime = new Date(user.currentTimerState.startTime);
            }
            // Ensure elapsedTime is a number
            user.currentTimerState.elapsedTime = Number(user.currentTimerState.elapsedTime) || 0;

            // Ensure user has settings
            user.settings = user.settings || { pricePerHour: 100 };
            user.settings.pricePerHour = Number(user.settings.pricePerHour) || 100;
        });
    }
}

// Saves data to localStorage - CORRECTED FUNCTION
function saveAppData() {
    const dataToSave = {
        users: [],
        currentUser: appData.currentUser // Copy currentUser directly
    };

    appData.users.forEach(user => {
        const userToSave = {
            username: user.username,
            password: user.password,
            settings: user.settings, // Copy settings directly
            currentTimerState: {
                elapsedTime: user.currentTimerState.elapsedTime,
                isRunning: user.currentTimerState.isRunning,
                // Convert startTime to ISO string ONLY if it's a Date object
                startTime: user.currentTimerState.startTime instanceof Date ? user.currentTimerState.startTime.toISOString() : null // Save as null if not a Date
            },
            history: []
        };

        // Ensure user.history exists before iterating
        if (user.history) {
            user.history.forEach(session => {
                const sessionToSave = {
                    id: session.id,
                    // Convert startTime and endTime to ISO strings
                    startTime: session.startTime instanceof Date ? session.startTime.toISOString() : null, // Ensure it's a Date before converting
                    endTime: session.endTime instanceof Date ? session.endTime.toISOString() : null, // Ensure it's a Date before converting
                    duration: session.duration,
                    cost: session.cost
                };
                userToSave.history.push(sessionToSave);
            });
        }


        dataToSave.users.push(userToSave);
    });

    localStorage.setItem(STORAGE_KEY_APP_DATA, JSON.stringify(dataToSave));
}

// --- User Management Functions ---

// Finds a user by username
function findUser(username) {
    return appData.users.find(user => user.username === username);
}

// Adds a new user
async function addUser(username, password) {
    if (findUser(username)) {
        return false; // User already exists
    }
    const hashedPassword = await hashPassword(password);
    const newUser = {
        username: username,
        password: hashedPassword, // Store hashed password
        settings: {
            pricePerHour: 100 // Default price
        },
        currentTimerState: {
            elapsedTime: 0,
            isRunning: false,
            startTime: null // Should be null initially
        },
        history: [] // Empty history initially
    };
    appData.users.push(newUser);
    saveAppData();
    return true; // User created successfully
}

// Gets the currently logged-in user object
function getCurrentUser() {
    if (appData.currentUser) {
        return findUser(appData.currentUser);
    }
    return null;
}

// --- UI Functions ---

function showSection(section) {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    timerSection.classList.add('hidden');
    configSection.classList.add('hidden');
    historySection.classList.add('hidden');

    section.classList.remove('hidden');
}

function showLogin() {
    showSection(loginSection);
    loginError.classList.add('hidden'); // Hide errors on section change
    registerSuccess.classList.add('hidden');
    // Clear input fields on showing login
    loginUsernameInput.value = '';
    loginPasswordInput.value = '';
}

function showRegister() {
    showSection(registerSection);
    registerError.classList.add('hidden'); // Hide errors on section change
    registerSuccess.classList.add('hidden');
    // Clear input fields on showing register
    registerUsernameInput.value = '';
    registerPasswordInput.value = '';
}

function showTimer() {
    showSection(timerSection);
    const currentUser = getCurrentUser();
    if (currentUser) {
        loggedInUsernameSpan.textContent = currentUser.username;

        // Load user-specific timer state
        // Ensure currentTimerState and its properties exist
        const timerState = currentUser.currentTimerState || { elapsedTime: 0, isRunning: false, startTime: null };

        elapsedTime = timerState.elapsedTime;
        isRunning = timerState.isRunning;
        startTime = timerState.startTime; // This will be a Date object or null after loadAppData
        currentSessionStartTime = startTime; // Restore session start time

        updateTimeDisplay();
        calculatePricePerMinute(); // Recalculate price based on user settings
        updateCostDisplay();

        // Restore button states
        if (isRunning) {
            startButton.disabled = true;
            pauseButton.disabled = false;
            stopButton.disabled = false;
            // If timer was running, restart the interval
            // Ensure startTime is a Date object before starting interval
            if (startTime instanceof Date) {
                startTimerInterval();
            } else {
                // If startTime is not a Date but isRunning is true, something is wrong.
                // Reset timer state to prevent issues.
                console.error("Invalid startTime loaded for running timer. Resetting timer state.");
                isRunning = false;
                elapsedTime = 0;
                startTime = null;
                currentSessionStartTime = null;
                startButton.disabled = false;
                pauseButton.disabled = true;
                stopButton.disabled = true;
                saveCurrentUserState(); // Save the reset state
                updateTimeDisplay();
                updateCostDisplay();
            }
        } else {
            startButton.disabled = false;
            pauseButton.disabled = true;
            stopButton.disabled = true;
        }
    } else {
        // Should not happen if logic is correct, but as a fallback
        showLogin();
    }
}

function showConfig() {
    showSection(configSection);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.settings) {
        pricePerHourInput.value = currentUser.settings.pricePerHour;
    } else {
        // Set default if settings are missing
        pricePerHourInput.value = 100;
    }
}

function showHistory() {
    showSection(historySection);
    loadHistory(); // Load and display history when showing the section
}

// --- Timer Functions ---

// Starts the timer interval
function startTimerInterval() {
    // Clear any existing interval to prevent duplicates
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        // Ensure startTime is a valid Date object before calculating
        if (startTime instanceof Date) {
            elapsedTime = Date.now() - startTime.getTime(); // Calculate elapsed time based on Date objects
            updateTimeDisplay();
            updateCostDisplay();
            // Save state periodically, but not too frequently to avoid performance issues
            // Maybe save every 10 seconds or when certain actions occur (pause, stop, logout)
            // saveCurrentUserState(); // Consider removing periodic saves or making them less frequent
        } else {
            console.error("Timer interval running with invalid startTime:", startTime);
            // Stop the timer if startTime is invalid
            handleStopTimerActions(); // Call the refactored stop timer actions
        }
    }, 1000); // Update every second
}

// Stops the timer interval
function stopTimerInterval() {
    clearInterval(timerInterval);
}

// Refactored function to handle common timer stopping actions
function handleStopTimerActions() {
    stopTimerInterval(); // Clear the interval
    isRunning = false;
    elapsedTime = 0;
    startTime = null;
    currentSessionStartTime = null;

    updateTimeDisplay(); // Update display to 00:00:00
    costDisplay.textContent = '0.00'; // Reset cost display

    startButton.disabled = false;
    pauseButton.disabled = true;
    stopButton.disabled = true;

    saveCurrentUserState(); // Save state after stopping (clears timer state)
}

function updateTimeDisplay() {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedTime =
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    timeDisplay.textContent = formattedTime;
}

function updateCostDisplay() {
    const elapsedMinutes = elapsedTime / 60000;
    const cost = elapsedMinutes * pricePerMinute;
    costDisplay.textContent = cost.toFixed(2);
}

function calculatePricePerMinute() {
    const currentUser = getCurrentUser();
    // Ensure currentUser and settings exist
    if (currentUser && currentUser.settings) {
        const pricePerHour = parseFloat(currentUser.settings.pricePerHour) || 100;
        pricePerMinute = pricePerHour / 60;
    } else {
        pricePerMinute = 100 / 60; // Default if no user or settings
    }
}

// --- State Saving Functions ---

// Saves the current state of the logged-in user's timer and settings
function saveCurrentUserState() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Ensure currentTimerState exists before accessing properties
        currentUser.currentTimerState = currentUser.currentTimerState || { elapsedTime: 0, isRunning: false, startTime: null };

        currentUser.currentTimerState.elapsedTime = elapsedTime;
        currentUser.currentTimerState.isRunning = isRunning;
        currentUser.currentTimerState.startTime = startTime; // This is a Date object or null

        // Settings are saved when the config form is submitted, no need to save here
        saveAppData(); // Save the entire app data
    }
}

// --- History Functions ---

// Adds a session to the current user's history
function addSessionToHistory() {
    const currentUser = getCurrentUser();
    // Ensure currentUser, currentSessionStartTime, and elapsedTime are valid
    if (currentUser && currentSessionStartTime instanceof Date && elapsedTime > 0) {
        const sessionEndTime = new Date();
        const sessionDuration = sessionEndTime.getTime() - currentSessionStartTime.getTime();
        // Recalculate cost based on the duration of this specific session
        const sessionCost = (sessionDuration / 60000) * pricePerMinute;

        const newSession = {
            id: Date.now() + Math.random().toString(16).slice(2), // Simple unique ID
            startTime: currentSessionStartTime, // Date object
            endTime: sessionEndTime, // Date object
            duration: sessionDuration, // milliseconds
            cost: sessionCost
        };

        // Ensure history array exists
        currentUser.history = currentUser.history || [];
        currentUser.history.push(newSession);
        saveAppData(); // Save history immediately
    } else if (currentUser && elapsedTime > 0) {
        console.warn("Could not add session to history: currentSessionStartTime is not a valid Date.", currentSessionStartTime);
    }
}

// Loads and displays the history for the current user
function loadHistory() {
    const currentUser = getCurrentUser();
    historyListDiv.innerHTML = ''; // Clear current list

    // Ensure currentUser and history exist
    if (currentUser && currentUser.history && currentUser.history.length > 0) {
        // Sort history by start time, newest first
        const sortedHistory = currentUser.history.sort((a, b) => {
            // Ensure a.startTime and b.startTime are Date objects before comparing
            const dateA = a.startTime instanceof Date ? a.startTime.getTime() : 0;
            const dateB = b.startTime instanceof Date ? b.startTime.getTime() : 0;
            return dateB - dateA;
        });

        sortedHistory.forEach(session => {
            // Ensure session dates are Date objects before formatting
            const startTimeStr = session.startTime instanceof Date ? session.startTime.toLocaleString() : 'Fecha inválida';
            const endTimeStr = session.endTime instanceof Date ? session.endTime.toLocaleString() : 'Fecha inválida';
            const durationMinutes = (Number(session.duration) / 60000).toFixed(2); // Ensure duration is a number
            const costStr = Number(session.cost).toFixed(2); // Ensure cost is a number

            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.innerHTML = `
                        <p><strong>Inicio:</strong> ${startTimeStr}</p>
                        <p><strong>Fin:</strong> ${endTimeStr}</p>
                        <p><strong>Duración:</strong> ${durationMinutes} minutos</p>
                        <p><strong>Costo:</strong> ${costStr} Pesos</p>
                    `;
            historyListDiv.appendChild(historyItem);
        });
    } else {
        historyListDiv.innerHTML = '<p class="text-gray-400">No hay historial disponible.</p>';
    }
}


// --- Event Listeners ---

// Login button
loginButton.addEventListener('click', async () => {
    const username = loginUsernameInput.value;
    const password = loginPasswordInput.value;
    const user = findUser(username);

    if (user) {
        const hashedPassword = await hashPassword(password);
        if (user.password === hashedPassword) {
            appData.currentUser = username;
            saveAppData(); // Save the logged-in user
            showTimer();
        } else {
            loginError.classList.remove('hidden');
        }
    } else {
        loginError.classList.remove('hidden');
    }
});

// Show Register Section button
showRegisterButton.addEventListener('click', () => {
    showRegister();
});

// Register Button
registerButton.addEventListener('click', async () => {
    const username = registerUsernameInput.value.trim(); // Trim whitespace
    const password = registerPasswordInput.value;

    if (username && password) {
        // addUser is now async, but we can call it without await if we don't need its result immediately
        // and the success/error handling is self-contained or doesn't depend on the sync result.
        // However, to correctly show success/error based on addUser's return, we should await it.
        const success = await addUser(username, password);
        if (success) {
            registerSuccess.classList.remove('hidden');
            registerError.classList.add('hidden');
            registerUsernameInput.value = ''; // Clear register fields
            registerPasswordInput.value = '';
            // Optionally, automatically switch to login after successful registration
            // setTimeout(showLogin, 2000);
        } else {
            registerError.classList.remove('hidden');
            registerSuccess.classList.add('hidden');
        }
    } else {
        // Provide feedback for empty fields
        alert("Por favor, ingresa un nombre de usuario y contraseña.");
    }
});

// Back to Login button from Register Section
backToLoginButton.addEventListener('click', () => {
    showLogin();
});


// Logout button
logoutButton.addEventListener('click', () => {
    // Save current user state before logging out
    saveCurrentUserState();

    // Stop timer and reset
    stopTimerInterval(); // Stop the interval
    isRunning = false;
    elapsedTime = 0;
    startTime = null;
    currentSessionStartTime = null;
    updateTimeDisplay();
    costDisplay.textContent = '0.00';
    startButton.disabled = false;
    pauseButton.disabled = true;
    stopButton.disabled = true;


    appData.currentUser = null; // Clear current user
    saveAppData(); // Save the updated state
    showLogin(); // Go back to login screen
});

// Start button
startButton.addEventListener('click', () => {
    if (!isRunning) {
        // If starting fresh or resuming from paused
        if (elapsedTime === 0) {
            // Starting a new session
            startTime = new Date(); // Set new start time
            currentSessionStartTime = startTime; // Set session start time
        } else {
            // Resuming from pause, calculate startTime based on elapsed time
            startTime = new Date(Date.now() - elapsedTime);
            // currentSessionStartTime remains the same for the session
        }

        startTimerInterval(); // Start the interval

        isRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        stopButton.disabled = false;
        calculatePricePerMinute(); // Ensure price is calculated
        saveCurrentUserState(); // Save state immediately on start
    }
});

// Pause button
pauseButton.addEventListener('click', () => {
    if (isRunning) {
        stopTimerInterval(); // Stop the interval
        isRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        saveCurrentUserState(); // Save state when paused
    }
});

// Stop button
stopButton.addEventListener('click', () => {
    // Only add to history if there was actual time elapsed in the current session
    if (elapsedTime > 0) {
        addSessionToHistory(); // Add the completed session to history
    }
    handleStopTimerActions(); // Call the refactored stop timer actions
});

// Config button
configButton.addEventListener('click', () => {
    showConfig();
});

// Save Config button
saveConfigButton.addEventListener('click', () => {
    const currentUser = getCurrentUser();
    const newPrice = parseFloat(pricePerHourInput.value);
    if (currentUser && !isNaN(newPrice) && newPrice >= 0) {
        currentUser.settings.pricePerHour = newPrice;
        saveAppData(); // Save the updated settings
        calculatePricePerMinute(); // Recalculate price after saving
        showTimer(); // Go back to timer after saving
    } else {
        alert("Por favor, ingresa un precio por hora válido (un número mayor o igual a 0).");
        // Reset input to current saved value if input is invalid
        if (currentUser && currentUser.settings) {
            pricePerHourInput.value = currentUser.settings.pricePerHour;
        } else {
            pricePerHourInput.value = 100; // Default
        }
    }
});

// Back button from Config
backButton.addEventListener('click', () => {
    showTimer();
});

// Show History button
showHistoryButton.addEventListener('click', () => {
    showHistory();
});

// Back button from History
backFromHistoryButton.addEventListener('click', () => {
    showTimer();
});


// --- Initial Load ---
loadAppData(); // Load data when the page loads

// Check if a user was previously logged in
if (appData.currentUser) {
    showTimer(); // Show timer if logged in
} else {
    showLogin(); // Show login if not logged in
}

// Save current user state before the window closes or refreshes
// Use 'pagehide' for better mobile support than 'beforeunload'
window.addEventListener('pagehide', saveCurrentUserState);
// Fallback for older browsers
window.addEventListener('beforeunload', saveCurrentUserState);
