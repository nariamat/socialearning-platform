// User Database (using localStorage)
const ADMIN_USERNAME = 'nariamat';
const ADMIN_PASSWORD = 'temitayo5sA@@';
const ACTIVATION_FEE = 1000;
const REFERRAL_REWARD = 100;
const TASKS = [
    { id: 1, title: 'Complete Survey', description: 'Answer a quick survey', reward: 500, difficulty: 'Easy' },
    { id: 2, title: 'Watch Video', description: 'Watch a 5-minute video', reward: 300, difficulty: 'Easy' },
    { id: 3, title: 'Download App', description: 'Download and install the app', reward: 1000, difficulty: 'Medium' },
    { id: 4, title: 'Play Game', description: 'Play the game for 10 minutes', reward: 200, difficulty: 'Easy' },
    { id: 5, title: 'Complete Offer', description: 'Complete a special offer', reward: 2000, difficulty: 'Hard' },
    { id: 6, title: 'Social Share', description: 'Share our platform on social media', reward: 400, difficulty: 'Easy' }
];

// Initialize users database
function initDatabase() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify({}));
    }
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', '');
    }
}

// Get all users
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}

// Get current user
function getCurrentUser() {
    const username = localStorage.getItem('currentUser');
    if (username) {
        return getAllUsers()[username];
    }
    return null;
}

// Save user
function saveUser(user) {
    const users = getAllUsers();
    users[user.username] = user;
    localStorage.setItem('users', JSON.stringify(users));
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const phone = document.getElementById('regPhone').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;

    // Validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (!acceptTerms) {
        alert('Please accept the terms and conditions');
        return;
    }

    const users = getAllUsers();
    if (users[username]) {
        alert('Username already exists!');
        return;
    }

    // Create referral link
    const referralCode = generateReferralCode();
    const referralLink = `${window.location.origin}?ref=${referralCode}`;

    // Create user object
    const newUser = {
        username,
        email,
        password,
        phone,
        balance: 0,
        totalEarnings: 0,
        referralEarnings: 0,
        referralLink,
        referralCode,
        referrals: [],
        completedTasks: [],
        createdAt: new Date().toISOString()
    };

    saveUser(newUser);
    alert('✅ Registration successful! Please pay the activation fee of ₦1,000 at the payment methods below:\n\nOPay: 9075885346 (TEMITAYO MATTHEW ABRAHAM)\nSmartCash: 9046166102 (TEMITAYO ABRAHAM)\n\nAfter payment, login to your account.');
    switchPage('loginPage');
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Check for VPN (mock check - blocks users with certain patterns)
    if (username.includes('vpn') || username.includes('proxy')) {
        alert('❌ VPN usage is not allowed on this platform!');
        return;
    }

    // Check if it's admin login
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('currentUser', username);
        switchPage('adminPage');
        return;
    }

    const users = getAllUsers();
    const user = users[username];

    if (!user) {
        alert('❌ User not found!');
        return;
    }

    if (user.password !== password) {
        alert('❌ Incorrect password!');
        return;
    }

    // Check if user has paid activation fee
    if (user.activationPaid !== true) {
        alert('⚠️ Activation fee not paid yet. Please pay ₦1,000 first.');
        return;
    }

    localStorage.setItem('currentUser', username);
    loadDashboard();
    switchPage('dashboardPage');
}

// Load Dashboard
function loadDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('dashboardUsername').textContent = user.username;
    document.getElementById('totalEarnings').textContent = user.totalEarnings || 0;
    document.getElementById('activeTasks').textContent = TASKS.length;
    document.getElementById('totalReferrals').textContent = (user.referrals || []).length;
    document.getElementById('referralEarnings').textContent = user.referralEarnings || 0;
    document.getElementById('settingsUsername').textContent = user.username;
    document.getElementById('settingsEmail').textContent = user.email;
    document.getElementById('withdrawBalance').textContent = user.balance || 0;

    loadTasks();
    loadReferrals();
}

// Load Tasks
function loadTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    tasksContainer.innerHTML = '';

    TASKS.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p style="font-size: 12px; color: #999;">Difficulty: ${task.difficulty}</p>
            <div class="task-reward">₦${task.reward}</div>
            <button onclick="completeTask(${task.id})">Complete Task</button>
        `;
        tasksContainer.appendChild(taskCard);
    });
}

// Complete Task
function completeTask(taskId) {
    const user = getCurrentUser();
    if (!user) return;

    const task = TASKS.find(t => t.id === taskId);
    if (!task) return;

    if (user.completedTasks && user.completedTasks.includes(taskId)) {
        alert('❌ You have already completed this task!');
        return;
    }

    // Add earnings
    if (!user.completedTasks) user.completedTasks = [];
    user.completedTasks.push(taskId);
    user.balance = (user.balance || 0) + task.reward;
    user.totalEarnings = (user.totalEarnings || 0) + task.reward;

    saveUser(user);
    alert(`✅ Task completed! You earned ₦${task.reward}`);
    loadDashboard();
}

// Load Referrals
function loadReferrals() {
    const user = getCurrentUser();
    if (!user) return;

    const referralLink = `${window.location.origin}?ref=${user.referralCode}`;
    document.getElementById('referralLink').value = referralLink;

    const referralsTable = document.querySelector('#referralsTable tbody');
    referralsTable.innerHTML = '';

    if (user.referrals && user.referrals.length > 0) {
        user.referrals.forEach(referral => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${referral.username}</td>
                <td>${new Date(referral.joinDate).toLocaleDateString()}</td>
                <td>₦${referral.earnings || 100}</td>
            `;
            referralsTable.appendChild(row);
        });
    } else {
        referralsTable.innerHTML = '<tr><td colspan="3" style="text-align: center;">No referrals yet</td></tr>';
    }
}

// Copy Referral Link
function copyReferralLink() {
    const referralLink = document.getElementById('referralLink');
    referralLink.select();
    document.execCommand('copy');
    alert('✅ Referral link copied to clipboard!');
}

// Handle Withdraw
function handleWithdraw(event) {
    event.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const method = document.getElementById('withdrawMethod').value;

    if (amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (amount > (user.balance || 0)) {
        alert(`❌ Insufficient balance! Your balance: ₦${user.balance || 0}`);
        return;
    }

    if (!method) {
        alert('Please select a payment method');
        return;
    }

    // Deduct from balance
    user.balance = (user.balance || 0) - amount;
    user.withdrawals = user.withdrawals || [];
    user.withdrawals.push({
        amount,
        method,
        date: new Date().toISOString(),
        status: 'Pending'
    });

    saveUser(user);
    alert(`✅ Withdrawal request submitted!\n\nAmount: ₦${amount}\nMethod: ${method === 'opay' ? 'OPay' : 'SmartCash'}\n\nYour money will be credited within 24 hours.`);
    document.getElementById('withdrawForm').reset();
    loadDashboard();
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load Dark Mode Preference
function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
}

// Switch Pages
function switchPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
        if (pageName === 'dashboardPage') {
            loadDashboard();
        }
    }
}

// Handle Logout
function handleLogout() {
    localStorage.setItem('currentUser', '');
    document.getElementById('loginForm').reset();
    switchPage('loginPage');
    alert('✅ You have been logged out successfully!');
}

// Handle Change Password
function handleChangePassword() {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        const user = getCurrentUser();
        if (user) {
            user.password = newPassword;
            saveUser(user);
            alert('✅ Password changed successfully!');
        }
    }
}

// Handle Delete Account
function handleDeleteAccount() {
    const confirm = prompt('Type your username to confirm account deletion:');
    const user = getCurrentUser();
    if (confirm === user.username) {
        const users = getAllUsers();
        delete users[user.username];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', '');
        alert('✅ Account deleted successfully!');
        switchPage('loginPage');
    } else {
        alert('❌ Account deletion cancelled!');
    }
}

// Generate Referral Code
function generateReferralCode() {
    return 'REF' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Check for referral in URL
function checkReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        localStorage.setItem('referralCode', refCode);
    }
}

// Initialize
function init() {
    initDatabase();
    loadDarkModePreference();
    checkReferralCode();
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        loadDashboard();
        switchPage('dashboardPage');
    } else {
        switchPage('loginPage');
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);

// Prevent VPN detection (mock)
window.addEventListener('load', function() {
    // Simple VPN detection check
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('vpn') || userAgent.includes('proxy')) {
        console.warn('VPN detected');
    }
});
