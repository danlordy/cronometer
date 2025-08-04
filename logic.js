// --- App Data Structure ---
let appData = {
    users: [],
    currentUser: null // Stores the username of the logged-in user
};

// --- Local Storage Key ---
const STORAGE_KEY_APP_DATA = 'costTimerAppData';

// Hashing function using SubtleCrypto - Note: crypto.subtle is only available in secure contexts (HTTPS) or localhost.
// For testing in Node.js (Jest), we'll need to polyfill it.
async function hashPassword(password) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Browser environment
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else if (typeof require !== 'undefined') {
        // Node.js environment (for testing)
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(password).digest('hex');
    }
    throw new Error("Crypto API not available");
}


// Loads data from localStorage
function loadAppData(storage) {
    const savedData = storage.getItem(STORAGE_KEY_APP_DATA);
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        appData.users = parsedData.users || [];
        appData.currentUser = parsedData.currentUser || null;

        appData.users.forEach(user => {
            user.history = user.history || [];
            user.history.forEach(session => {
                if (typeof session.startTime === 'string') session.startTime = new Date(session.startTime);
                if (typeof session.endTime === 'string') session.endTime = new Date(session.endTime);
                session.duration = Number(session.duration) || 0;
                session.cost = Number(session.cost) || 0;
            });
            user.currentTimerState = user.currentTimerState || { elapsedTime: 0, isRunning: false, startTime: null };
            if (typeof user.currentTimerState.startTime === 'string') {
                user.currentTimerState.startTime = new Date(user.currentTimerState.startTime);
            }
            user.currentTimerState.elapsedTime = Number(user.currentTimerState.elapsedTime) || 0;
            user.settings = user.settings || { pricePerHour: 100, currencySymbol: '$' };
            user.settings.pricePerHour = Number(user.settings.pricePerHour) || 100;
            if (typeof user.settings.currencySymbol === 'undefined') user.settings.currencySymbol = '$';
        });
    }
    return appData;
}

// Saves data to localStorage
function saveAppData(storage) {
    const dataToSave = {
        users: [],
        currentUser: appData.currentUser
    };

    appData.users.forEach(user => {
        const userToSave = {
            username: user.username,
            password: user.password,
            settings: user.settings,
            currentTimerState: {
                elapsedTime: user.currentTimerState.elapsedTime,
                isRunning: user.currentTimerState.isRunning,
                startTime: user.currentTimerState.startTime instanceof Date ? user.currentTimerState.startTime.toISOString() : null
            },
            history: []
        };

        if (user.history) {
            user.history.forEach(session => {
                userToSave.history.push({
                    id: session.id,
                    startTime: session.startTime instanceof Date ? session.startTime.toISOString() : null,
                    endTime: session.endTime instanceof Date ? session.endTime.toISOString() : null,
                    duration: session.duration,
                    cost: session.cost,
                    taskName: session.taskName,
                });
            });
        }
        dataToSave.users.push(userToSave);
    });

    storage.setItem(STORAGE_KEY_APP_DATA, JSON.stringify(dataToSave));
}

// Finds a user by username
function findUser(username) {
    return appData.users.find(user => user.username === username);
}

// Adds a new user
async function addUser(username, password) {
    if (findUser(username)) {
        return false;
    }
    const hashedPassword = await hashPassword(password);
    const newUser = {
        username: username,
        password: hashedPassword,
        settings: { pricePerHour: 100, currencySymbol: '$' },
        currentTimerState: { elapsedTime: 0, isRunning: false, startTime: null },
        history: []
    };
    appData.users.push(newUser);
    // In a real app, saveAppData would be called here, but in tests we might not want that side-effect.
    return true;
}

// Gets the currently logged-in user object
function getCurrentUser() {
    if (appData.currentUser) {
        return findUser(appData.currentUser);
    }
    return null;
}

function setCurrentUser(username) {
    appData.currentUser = username;
}

function formatTime(elapsedTime) {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
        .map(v => String(v).padStart(2, '0'))
        .join(':');
}

function calculateCost(elapsedTime, pricePerHour) {
    const pricePerMinute = (pricePerHour || 0) / 60;
    const elapsedMinutes = elapsedTime / 60000;
    return elapsedMinutes * pricePerMinute;
}

function addSessionToHistory(user, sessionStartTime, elapsedTime, pricePerHour, taskName) {
    if (!user || !(sessionStartTime instanceof Date) || elapsedTime <= 0) {
        return;
    }
    const sessionEndTime = new Date();
    const sessionDuration = sessionEndTime.getTime() - sessionStartTime.getTime();
    const pricePerMinute = (pricePerHour || 0) / 60;
    const sessionCost = (sessionDuration / 60000) * pricePerMinute;

    const newSession = {
        id: Date.now() + Math.random().toString(16).slice(2),
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        duration: sessionDuration,
        cost: sessionCost,
        taskName: taskName || "Sin Título"
    };

    user.history = user.history || [];
    user.history.push(newSession);
}


// Export for both Node.js (Jest) and browser environments
(function(exports) {

    exports.appData = {
        users: [],
        currentUser: null
    };

    exports.STORAGE_KEY_APP_DATA = 'costTimerAppData';

    exports.hashPassword = async function(password) {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } else if (typeof require !== 'undefined') {
            const crypto = require('crypto');
            return crypto.createHash('sha256').update(password).digest('hex');
        }
        throw new Error("Crypto API not available");
    };

    exports.loadAppData = function(storage) {
        const savedData = storage.getItem(exports.STORAGE_KEY_APP_DATA);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            exports.appData.users = parsedData.users || [];
            exports.appData.currentUser = parsedData.currentUser || null;

            exports.appData.users.forEach(user => {
                user.history = user.history || [];
                user.history.forEach(session => {
                    if (typeof session.startTime === 'string') session.startTime = new Date(session.startTime);
                    if (typeof session.endTime === 'string') session.endTime = new Date(session.endTime);
                    session.duration = Number(session.duration) || 0;
                    session.cost = Number(session.cost) || 0;
                });
                user.currentTimerState = user.currentTimerState || { elapsedTime: 0, isRunning: false, startTime: null };
                if (typeof user.currentTimerState.startTime === 'string') {
                    user.currentTimerState.startTime = new Date(user.currentTimerState.startTime);
                }
                user.currentTimerState.elapsedTime = Number(user.currentTimerState.elapsedTime) || 0;
                user.settings = user.settings || { pricePerHour: 100, currencySymbol: '$' };
                user.settings.pricePerHour = Number(user.settings.pricePerHour) || 100;
                if (typeof user.settings.currencySymbol === 'undefined') user.settings.currencySymbol = '$';
            });
        }
        return exports.appData;
    };

    exports.saveAppData = function(storage) {
        const dataToSave = {
            users: [],
            currentUser: exports.appData.currentUser
        };

        exports.appData.users.forEach(user => {
            const userToSave = {
                username: user.username,
                password: user.password,
                settings: user.settings,
                currentTimerState: {
                    elapsedTime: user.currentTimerState.elapsedTime,
                    isRunning: user.currentTimerState.isRunning,
                    startTime: user.currentTimerState.startTime instanceof Date ? user.currentTimerState.startTime.toISOString() : null
                },
                history: []
            };

            if (user.history) {
                user.history.forEach(session => {
                    userToSave.history.push({
                        id: session.id,
                        startTime: session.startTime instanceof Date ? session.startTime.toISOString() : null,
                        endTime: session.endTime instanceof Date ? session.endTime.toISOString() : null,
                        duration: session.duration,
                        cost: session.cost,
                        taskName: session.taskName
                    });
                });
            }
            dataToSave.users.push(userToSave);
        });

        storage.setItem(exports.STORAGE_KEY_APP_DATA, JSON.stringify(dataToSave));
    };

    exports.findUser = function(username) {
        return exports.appData.users.find(user => user.username === username);
    };

    exports.addUser = async function(username, password) {
        if (exports.findUser(username)) {
            return false;
        }
        const hashedPassword = await exports.hashPassword(password);
        const newUser = {
            username: username,
            password: hashedPassword,
            settings: { pricePerHour: 100, currencySymbol: '$' },
            currentTimerState: { elapsedTime: 0, isRunning: false, startTime: null },
            history: []
        };
        exports.appData.users.push(newUser);
        return true;
    };

    exports.getCurrentUser = function() {
        if (exports.appData.currentUser) {
            return exports.findUser(exports.appData.currentUser);
        }
        return null;
    };

    exports.setCurrentUser = function(username) {
        exports.appData.currentUser = username;
    };

    exports.formatTime = function(elapsedTime) {
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return [hours, minutes, seconds]
            .map(v => String(v).padStart(2, '0'))
            .join(':');
    };

    exports.calculateCost = function(elapsedTime, pricePerHour) {
        const pricePerMinute = (pricePerHour || 0) / 60;
        const elapsedMinutes = elapsedTime / 60000;
        return elapsedMinutes * pricePerMinute;
    };

    exports.addSessionToHistory = function(user, sessionStartTime, elapsedTime, pricePerHour, taskName) {
        if (!user || !(sessionStartTime instanceof Date) || elapsedTime <= 0) {
            return;
        }
        const sessionEndTime = new Date();
        // The duration should be based on the timer's elapsed time, not the difference between start and end time objects,
        // especially if the timer was paused.
        const sessionDuration = elapsedTime;
        const pricePerMinute = (pricePerHour || 0) / 60;
        const sessionCost = (sessionDuration / 60000) * pricePerMinute;

        const newSession = {
            id: Date.now() + Math.random().toString(16).slice(2),
            startTime: sessionStartTime,
            endTime: sessionEndTime,
            duration: sessionDuration,
            cost: sessionCost,
            taskName: taskName || "Sin Título"
        };

        user.history = user.history || [];
        user.history.push(newSession);
    };

}(typeof exports === 'undefined' ? (this.appLogic = {}) : exports));
