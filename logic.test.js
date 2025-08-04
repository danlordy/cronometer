const {
    appData,
    hashPassword,
    loadAppData,
    saveAppData,
    findUser,
    addUser,
    getCurrentUser,
    setCurrentUser,
    formatTime,
    calculateCost,
    addSessionToHistory
} = require('./logic.js');

// Mock localStorage
class LocalStorageMock {
    constructor() {
        this.store = {};
    }
    clear() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = String(value);
    }
    removeItem(key) {
        delete this.store[key];
    }
}

describe('User Management', () => {
    beforeEach(() => {
        // Reset appData before each test
        appData.users = [];
        appData.currentUser = null;
    });

    test('should add a new user', async () => {
        const result = await addUser('testuser', 'password123');
        expect(result).toBe(true);
        expect(appData.users.length).toBe(1);
        expect(appData.users[0].username).toBe('testuser');
    });

    test('should not add a duplicate user', async () => {
        await addUser('testuser', 'password123');
        const result = await addUser('testuser', 'password456');
        expect(result).toBe(false);
        expect(appData.users.length).toBe(1);
    });

    test('should find an existing user', async () => {
        await addUser('testuser', 'password123');
        const user = findUser('testuser');
        expect(user).not.toBeNull();
        expect(user.username).toBe('testuser');
    });

    test('should not find a non-existent user', () => {
        const user = findUser('nonexistent');
        expect(user).toBeUndefined();
    });

    test('should set and get the current user', async () => {
        await addUser('testuser', 'password123');
        setCurrentUser('testuser');
        const currentUser = getCurrentUser();
        expect(currentUser).not.toBeNull();
        expect(currentUser.username).toBe('testuser');
    });
});

describe('Time and Cost Calculation', () => {
    test('should format time correctly', () => {
        expect(formatTime(0)).toBe('00:00:00');
        expect(formatTime(1000)).toBe('00:00:01');
        expect(formatTime(60000)).toBe('00:01:00');
        expect(formatTime(3600000)).toBe('01:00:00');
        expect(formatTime(90061000)).toBe('25:01:01');
    });

    test('should calculate cost correctly', () => {
        const pricePerHour = 100;
        // 30 minutes
        const elapsedTime = 30 * 60 * 1000;
        const cost = calculateCost(elapsedTime, pricePerHour);
        expect(cost).toBe(50);
    });

    test('should calculate cost with zero price', () => {
        const cost = calculateCost(30 * 60 * 1000, 0);
        expect(cost).toBe(0);
    });
});

describe('Data Persistence', () => {
    let storage;

    beforeEach(() => {
        storage = new LocalStorageMock();
        appData.users = [];
        appData.currentUser = null;
    });

    test('should save and load app data', async () => {
        await addUser('testuser', 'password123');
        setCurrentUser('testuser');
        saveAppData(storage);

        // Reset in-memory data
        appData.users = [];
        appData.currentUser = null;

        loadAppData(storage);
        expect(appData.users.length).toBe(1);
        expect(appData.currentUser).toBe('testuser');
        const user = getCurrentUser();
        expect(user.username).toBe('testuser');
    });
});

describe('History Management', () => {
    let user;

    beforeEach(async () => {
        appData.users = [];
        await addUser('historyuser', 'password');
        user = findUser('historyuser');
    });

    test('should add a session to history', () => {
        const startTime = new Date(Date.now() - 3600000); // 1 hour ago
        const elapsedTime = 3600000;
        const pricePerHour = 120;

        addSessionToHistory(user, startTime, elapsedTime, pricePerHour, 'Test Task');

        expect(user.history.length).toBe(1);
        const session = user.history[0];
        expect(session.taskName).toBe('Test Task');
        expect(session.duration).toBe(elapsedTime);
        expect(session.cost).toBeCloseTo(120);
    });
});
