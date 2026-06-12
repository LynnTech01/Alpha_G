// Data Storage
let saccoData = {
    members: [],
    savingsTransactions: [],
    loans: [],
    loanPayments: [],
    expenditures: [],
    memberGrowth: [],
    monthlyFinancials: [],
    nextMemberId: 1001,
    nextReceiptNo: 1,
    nextTransCode: 1,
    nextLoanId: 2001
};

// Chart instances
let savingsLoansChart, incomeChart, parChart, memberGrowthChart, monthlyPerformanceChart, loanTypesChart;

// Helper Functions
function getMemberName(id) {
    if (!saccoData.members) return "Unknown";
    let m = saccoData.members.find(m => m.id === id);
    return m ? m.name : "Unknown";
}

function getMemberSavingsBalance(memberId) {
    let balance = 0;
    if (!saccoData.savingsTransactions) return 0;
    saccoData.savingsTransactions.filter(t => t.memberId === memberId).forEach(t => {
        if (t.type === 'deposit') balance += t.amount;
        else balance -= (t.amount + (t.charge || 0));
    });
    return balance;
}

function generateReceiptNo() { 
    saccoData.nextReceiptNo = saccoData.nextReceiptNo || 1;
    return `RCP-${saccoData.nextReceiptNo++}`; 
}

function generateTransCode() { 
    saccoData.nextTransCode = saccoData.nextTransCode || 1;
    return `TR-${saccoData.nextTransCode++}`; 
}

function saveData() { 
    localStorage.setItem('saccoData', JSON.stringify(saccoData)); 
}

// Initialize Sample Data
function initData() {
    if (localStorage.getItem('saccoData')) {
        saccoData = JSON.parse(localStorage.getItem('saccoData'));
        // Ensure all arrays exist
        if (!saccoData.memberGrowth) saccoData.memberGrowth = [];
        if (!saccoData.monthlyFinancials) saccoData.monthlyFinancials = [];
        if (!saccoData.loanPayments) saccoData.loanPayments = [];
        if (!saccoData.expenditures) saccoData.expenditures = [];
    } else {
        // Sample Members
        saccoData.members = [
            { id: 1001, name: "John Wambugu", idNumber: "12345678", phone: "0712345678", type: "Individual", status: "Active", joinDate: new Date().toISOString() },
            { id: 1002, name: "Leonard Mwathi", idNumber: "87654321", phone: "0723456789", type: "Individual", status: "Active", joinDate: new Date().toISOString() },
            { id: 1003, name: "Charles Maina", idNumber: "11223344", phone: "0734567890", type: "CIG", status: "Active", joinDate: new Date().toISOString() }
        ];
        
        // Sample Savings
        saccoData.savingsTransactions = [
            { id: 1, date: new Date().toISOString(), memberId: 1001, type: "deposit", amount: 100000, receiptNo: "RCP-1", paymentMode: "M-Pesa", transCode: "TR-1", charge: 0 },
            { id: 2, date: new Date(Date.now() - 86400000).toISOString(), memberId: 1002, type: "deposit", amount: 85000, receiptNo: "RCP-2", paymentMode: "Cash", transCode: "TR-2", charge: 0 },
            { id: 3, date: new Date(Date.now() - 172800000).toISOString(), memberId: 1003, type: "deposit", amount: 89725, receiptNo: "RCP-3", paymentMode: "Bank", transCode: "TR-3", charge: 0 }
        ];
        
        // Sample Loans
        saccoData.loans = [
            { id: 2001, memberId: 1001, type: "DV12", amount: 250000, balance: 180000, interest: 12, term: 12, monthlyInstallment: 23333.33, disbursementDate: new Date().toISOString(), status: "Active", lateDays: 5, fines: 0 },
            { id: 2002, memberId: 1002, type: "DV18", amount: 150000, balance: 120000, interest: 12, term: 18, monthlyInstallment: 10000, disbursementDate: new Date().toISOString(), status: "Active", lateDays: 0, fines: 0 },
            { id: 2003, memberId: 1003, type: "UZ12", amount: 114958, balance: 114958, interest: 18, term: 12, monthlyInstallment: 11300, disbursementDate: new Date().toISOString(), status: "Active", lateDays: 35, fines: 1500 }
        ];
        
        saccoData.loanPayments = [];
        saccoData.expenditures = [];
        saccoData.memberGrowth = [];
        saccoData.monthlyFinancials = [];
        saccoData.nextMemberId = 1004;
        saccoData.nextReceiptNo = 4;
        saccoData.nextTransCode = 4;
        saccoData.nextLoanId = 2004;
    }
    
    // Initialize growth data if empty
    if (saccoData.memberGrowth.length === 0) {
        let month = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
        let active = saccoData.members.filter(m => m.status === 'Active').length;
        saccoData.memberGrowth.push({ month, count: active, newJoins: saccoData.members.length });
    }
    
    // Initialize monthly financials if empty
    if (saccoData.monthlyFinancials.length === 0) {
        let month = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
        let totalIncome = saccoData.expenditures.reduce((s, e) => s + (e.amount < 0 ? Math.abs(e.amount) : 0), 0);
        let totalExpenses = saccoData.expenditures.reduce((s, e) => s + (e.amount > 0 ? e.amount : 0), 0);
        let savingsTotal = saccoData.members.reduce((s, m) => s + getMemberSavingsBalance(m.id), 0);
        let loansOut = saccoData.loans.reduce((s, l) => s + (l.status === 'Active' ? l.balance : 0), 0);
        saccoData.monthlyFinancials.push({
            month, income: totalIncome, expenses: totalExpenses, profit: totalIncome - totalExpenses,
            savings: savingsTotal, loans: loansOut, members: saccoData.members.filter(m => m.status === 'Active').length
        });
    }
    
    saveData();
}

function updateMemberGrowthTracking() {
    // Safely update member growth
    if (!saccoData.memberGrowth) saccoData.memberGrowth = [];
    
    let month = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    let active = saccoData.members.filter(m => m.status === 'Active').length;
    let entry = saccoData.memberGrowth.find(e => e.month === month);
    if (entry) {
        entry.count = active;
    } else {
        saccoData.memberGrowth.push({ month, count: active, newJoins: saccoData.members.length });
    }
    saveData();
}

function updateMonthlyFinancialData() {
    if (!saccoData.monthlyFinancials) saccoData.monthlyFinancials = [];
    
    let month = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    let totalIncome = saccoData.expenditures.reduce((s, e) => s + (e.amount < 0 ? Math.abs(e.amount) : 0), 0);
    let totalExpenses = saccoData.expenditures.reduce((s, e) => s + (e.amount > 0 ? e.amount : 0), 0);
    let savingsTotal = saccoData.members.reduce((s, m) => s + getMemberSavingsBalance(m.id), 0);
    let loansOut = saccoData.loans.reduce((s, l) => s + (l.status === 'Active' ? l.balance : 0), 0);
    let entry = saccoData.monthlyFinancials.find(e => e.month === month);
    if (entry) {
        entry.income = totalIncome;
        entry.expenses = totalExpenses;
        entry.profit = totalIncome - totalExpenses;
        entry.savings = savingsTotal;
        entry.loans = loansOut;
        entry.members = saccoData.members.filter(m => m.status === 'Active').length;
    } else {
        saccoData.monthlyFinancials.push({
            month, income: totalIncome, expenses: totalExpenses, profit: totalIncome - totalExpenses,
            savings: savingsTotal, loans: loansOut, members: saccoData.members.filter(m => m.status === 'Active').length
        });
    }
    saveData();
}

function calculatePAR() {
    let totalOut = 0, par30 = 0, par60 = 0, par90 = 0;
    saccoData.loans.forEach(l => {
        if (l.status === "Active") {
            totalOut += l.balance;
            if (l.lateDays > 30) par30 += l.balance;
            if (l.lateDays > 60) par60 += l.balance;
            if (l.lateDays > 90) par90 += l.balance;
        }
    });
    return {
        totalOutstanding: totalOut,
        par30: totalOut ? (par30 / totalOut) * 100 : 0,
        par60: totalOut ? (par60 / totalOut) * 100 : 0,
        par90: totalOut ? (par90 / totalOut) * 100 : 0,
        par30Amount: par30,
        par60Amount: par60,
        par90Amount: par90
    };
}

// Dashboard Display
function updateDashboard() {
    let totalMembers = saccoData.members.filter(m => m.status === 'Active').length;
    let totalSavings = saccoData.members.reduce((s, m) => s + getMemberSavingsBalance(m.id), 0);
    let totalLoansOut = saccoData.loans.reduce((s, l) => s + (l.status === 'Active' ? l.balance : 0), 0);
    let totalIncome = saccoData.expenditures.reduce((s, e) => s + (e.amount < 0 ? Math.abs(e.amount) : 0), 0);
    
    const statsDiv = document.getElementById('dashboardStats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="stat-card">
                <h3>👥 Active Members</h3>
                <div class="stat-number">${totalMembers}</div>
            </div>
            <div class="stat-card">
                <h3>💰 Total Savings</h3>
                <div class="stat-number">KSH ${totalSavings.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <h3>📈 Loans Outstanding</h3>
                <div class="stat-number">KSH ${totalLoansOut.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <h3>💵 Total Income</h3>
                <div class="stat-number">KSH ${totalIncome.toLocaleString()}</div>
            </div>
        `;
    }
    
    // Recent Transactions
    let recent = [];
    saccoData.savingsTransactions.forEach(t => {
        recent.push({
            date: new Date(t.date),
            desc: `${getMemberName(t.memberId)} - ${t.type === 'deposit' ? 'Deposit' : 'Withdrawal'}`,
            amount: t.type === 'deposit' ? t.amount : -t.amount,
            type: t.type === 'deposit' ? 'deposit' : 'withdrawal'
        });
    });
    saccoData.loanPayments.forEach(p => {
        let l = saccoData.loans.find(l => l.id === p.loanId);
        if (l) {
            recent.push({
                date: new Date(p.date),
                desc: `${getMemberName(l.memberId)} - Loan Payment`,
                amount: p.amount,
                type: 'loan'
            });
        }
    });
    recent.sort((a, b) => b.date - a.date);
    
    const recentDiv = document.getElementById('recentTransactions');
    if (recentDiv) {
        let recentHtml = '<div>';
        recent.slice(0, 8).forEach(t => {
            recentHtml += `
                <div class="transaction-item">
                    <div><strong>${t.desc}</strong><br><small>${t.date.toLocaleDateString()}</small></div>
                    <div><span class="transaction-type ${t.type}">${t.amount > 0 ? 'Credit' : 'Debit'}</span>
                    <strong style="margin-left:10px;">KSH ${Math.abs(t.amount).toLocaleString()}</strong></div>
                </div>
            `;
        });
        recentHtml += '</div>';
        if (recent.length === 0) recentHtml = '<p>No transactions yet.</p>';
        recentDiv.innerHTML = recentHtml;
    }
}

function updateMembersList() {
    let html = '<tbody>';
    saccoData.members.forEach(m => {
        html += `
            <tr>
                <td>${m.id}</td>
                <td>${m.name}</td>
                <td>${m.phone}</td>
                <td>${m.type}</td>
                <td>KSH ${getMemberSavingsBalance(m.id).toLocaleString()}</td>
                <td>KSH ${saccoData.loans.filter(l => l.memberId === m.id && l.status === 'Active').reduce((s, l) => s + l.balance, 0).toLocaleString()}</td>
                <td class="member-status-${m.status === 'Active' ? 'active' : 'inactive'}">${m.status}</td>
                <td>
                    <button onclick="viewMemberStatement(${m.id})" class="btn btn-primary" style="padding:0.2rem 0.5rem;">Statement</button>
                    ${m.status === 'Active' ? 
                        `<button onclick="showRemoveMemberModal(${m.id})" class="btn btn-danger" style="padding:0.2rem 0.5rem; margin-left:5px;">Remove</button>` :
                        `<button onclick="reactivateMember(${m.id})" class="btn" style="background:#28a745;color:white;padding:0.2rem 0.5rem; margin-left:5px;">Reactivate</button>`
                    }
                </td>
            </tr>
        `;
    });
    html += '</tbody>';
    const membersList = document.getElementById('membersList');
    if (membersList) membersList.innerHTML = html;
}

function updateSavingsHistory() {
    let html = '<tbody>';
    saccoData.savingsTransactions.slice().reverse().forEach(t => {
        html += `
            <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${getMemberName(t.memberId)}</td>
                <td>${t.type}</td>
                <td>KSH ${t.amount.toLocaleString()}</td>
                <td>${t.receiptNo}</td>
                <td>${t.paymentMode}</td>
                <td>${t.transCode}</td>
            </tr>
        `;
    });
    html += '</tbody>';
    const savingsHistory = document.getElementById('savingsHistory');
    if (savingsHistory) savingsHistory.innerHTML = html;
}

function updateLoansList() {
    let html = '<tbody>';
    saccoData.loans.forEach(l => {
        html += `
            <tr>
                <td>${l.id}</td>
                <td>${getMemberName(l.memberId)}</td>
                <td>${l.type}</td>
                <td>KSH ${l.amount.toLocaleString()}</td>
                <td>KSH ${l.balance.toLocaleString()}</td>
                <td>KSH ${l.monthlyInstallment.toFixed(2)}</td>
                <td>${l.lateDays}</td>
                <td>KSH ${l.fines.toFixed(2)}</td>
                <td style="color:${l.status === 'Active' ? 'green' : 'gray'}">${l.status}</td>
            </tr>
        `;
    });
    html += '</tbody>';
    const loansList = document.getElementById('loansList');
    if (loansList) loansList.innerHTML = html;
}

function updateExpenditureList() {
    let html = '<tbody>';
    saccoData.expenditures.slice().reverse().forEach(e => {
        html += `
            <tr>
                <td>${new Date(e.date).toLocaleDateString()}</td>
                <td>${e.category}</td>
                <td>KSH ${Math.abs(e.amount).toLocaleString()}</td>
                <td>${e.description || '-'}</td>
            </tr>
        `;
    });
    html += '</tbody>';
    const expenditureList = document.getElementById('expenditureList');
    if (expenditureList) expenditureList.innerHTML = html;
}

function updateFinancialStatements() {
    let totalIncome = saccoData.expenditures.reduce((s, e) => s + (e.amount < 0 ? Math.abs(e.amount) : 0), 0);
    let totalExpenses = saccoData.expenditures.reduce((s, e) => s + (e.amount > 0 ? e.amount : 0), 0);
    let totalAssets = saccoData.members.reduce((s, m) => s + getMemberSavingsBalance(m.id), 0) + 
                      saccoData.loans.reduce((s, l) => s + l.balance, 0);
    
    const trialBalance = document.getElementById('trialBalance');
    if (trialBalance) {
        trialBalance.innerHTML = `<div class="financial-table">
            <table>
                <tr><th>Account</th><th>Debit</th><th>Credit</th></tr>
                <tr><td>Savings & Loan Assets</td><td>KSH ${totalAssets.toLocaleString()}</td><td>-</td></tr>
                <tr><td>Income from Fees</td><td>-</td><td>KSH ${totalIncome.toLocaleString()}</td></tr>
                <tr><td>Operating Expenses</td><td>KSH ${totalExpenses.toLocaleString()}</td><td>-</td></tr>
                <tr class="total-row"><td><strong>TOTAL</strong></td>
                <td><strong>KSH ${(totalAssets + totalExpenses).toLocaleString()}</strong></td>
                <td><strong>KSH ${totalIncome.toLocaleString()}</strong></td>
                </tr>
            </table>
        </div>`;
    }
    
    const incomeStatement = document.getElementById('incomeStatement');
    if (incomeStatement) {
        incomeStatement.innerHTML = `<div class="financial-table">
            <table>
                <tr><td>Loan & Fee Income</td><td>KSH ${totalIncome.toLocaleString()}</td></tr>
                <tr><td>Less: Expenses</td><td>KSH ${totalExpenses.toLocaleString()}</td></tr>
                <tr class="total-row"><td>Net Income</td><td>KSH ${(totalIncome - totalExpenses).toLocaleString()}</td></tr>
            </table>
        </div>`;
    }
    
    const balanceSheet = document.getElementById('balanceSheet');
    if (balanceSheet) {
        balanceSheet.innerHTML = `<div class="financial-table">
            <table>
                <tr><th>ASSETS</th><th></th></tr>
                <tr><td>Portfolio & Savings</td><td>KSH ${totalAssets.toLocaleString()}</td></tr>
                <tr class="total-row"><td>Total Assets</td><td>KSH ${totalAssets.toLocaleString()}</td></tr>
                <tr><th>EQUITY</th><th></th></tr>
                <tr><td>Members' Savings</td><td>KSH ${saccoData.members.reduce((s, m) => s + getMemberSavingsBalance(m.id), 0).toLocaleString()}</td></tr>
            </table>
        </div>`;
    }
}

function updatePARReport() {
    let par = calculatePAR();
    const parReport = document.getElementById('parReport');
    if (parReport) {
        parReport.innerHTML = `<div class="par-container">
            <div class="par-card">
                <h4>>30 Days Past Due</h4>
                <div class="par-value">KSH ${par.par30Amount.toLocaleString()}</div>
                <div>${par.par30.toFixed(2)}% of Portfolio</div>
            </div>
            <div class="par-card">
                <h4>>60 Days Past Due</h4>
                <div class="par-value">KSH ${par.par60Amount.toLocaleString()}</div>
                <div>${par.par60.toFixed(2)}% of Portfolio</div>
            </div>
            <div class="par-card">
                <h4>>90 Days Past Due</h4>
                <div class="par-value">KSH ${par.par90Amount.toLocaleString()}</div>
                <div>${par.par90.toFixed(2)}% of Portfolio</div>
            </div>
            <div class="par-card">
                <h4>Total Outstanding Portfolio</h4>
                <div class="par-value">KSH ${par.totalOutstanding.toLocaleString()}</div>
            </div>
        </div>`;
    }
}

function updateDropdowns() {
    const activeMembers = saccoData.members.filter(m => m.status === 'Active');
    ['savingsMember', 'loanMember', 'reportMember'].forEach(id => {
        let sel = document.getElementById(id);
        if (sel) {
            sel.innerHTML = activeMembers.map(m => `<option value="${m.id}">${m.name} (${m.id})</option>`).join('');
        }
    });
    let loanSel = document.getElementById('paymentLoan');
    if (loanSel) {
        loanSel.innerHTML = saccoData.loans.filter(l => l.status === 'Active')
            .map(l => `<option value="${l.id}">${getMemberName(l.memberId)} - ${l.type} (Balance: KSH ${l.balance.toLocaleString()})</option>`).join('');
    }
}

// Chart Functions
function refreshCharts() {
    // Check if canvas elements exist
    const savingsCanvas = document.getElementById('savingsLoansChart');
    const incomeCanvas = document.getElementById('incomeChart');
    const parCanvas = document.getElementById('parChart');
    const growthCanvas = document.getElementById('memberGrowthChart');
    const monthlyCanvas = document.getElementById('monthlyPerformanceChart');
    const loanTypesCanvas = document.getElementById('loanTypesChart');
    
    if (!savingsCanvas || !incomeCanvas || !parCanvas || !growthCanvas) {
        console.log("Charts not ready yet");
        return;
    }
    
    let totalSavings = saccoData.members.reduce((s, m) => s + getMemberSavingsBalance(m.id), 0);
    let totalLoansOut = saccoData.loans.reduce((s, l) => s + (l.status === 'Active' ? l.balance : 0), 0);
    let totalDisb = saccoData.loans.reduce((s, l) => s + l.amount, 0);
    
    if (savingsLoansChart) savingsLoansChart.destroy();
    savingsLoansChart = new Chart(savingsCanvas, {
        type: 'bar',
        data: {
            labels: ['Total Savings', 'Loans Outstanding', 'Total Disbursed'],
            datasets: [{
                label: 'Amount (KSH)',
                data: [totalSavings, totalLoansOut, totalDisb],
                backgroundColor: ['rgba(54,162,235,0.8)', 'rgba(255,99,132,0.8)', 'rgba(75,192,192,0.8)']
            }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });
    
    let feeIncome = saccoData.expenditures.reduce((s, e) => s + (e.amount < 0 && e.category === 'Loan Fees Income' ? Math.abs(e.amount) : 0), 0);
    let withdrawalIncome = saccoData.expenditures.reduce((s, e) => s + (e.amount > 0 && e.category === 'Withdrawal Charges' ? e.amount : 0), 0);
    
    if (incomeChart) incomeChart.destroy();
    incomeChart = new Chart(incomeCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Loan Fees', 'Withdrawal Charges'],
            datasets: [{ data: [feeIncome || 1000, withdrawalIncome || 500], backgroundColor: ['#ff6384', '#36a2eb'] }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });
    
    let par = calculatePAR();
    if (parChart) parChart.destroy();
    parChart = new Chart(parCanvas, {
        type: 'line',
        data: {
            labels: ['>30 Days', '>60 Days', '>90 Days'],
            datasets: [
                { label: 'PAR Percentage (%)', data: [par.par30, par.par60, par.par90], borderColor: 'red', tension: 0.4 },
                { label: 'Amount (KSH)', data: [par.par30Amount, par.par60Amount, par.par90Amount], borderColor: 'blue', yAxisID: 'y1', tension: 0.4 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: { y1: { position: 'right', title: { display: true, text: 'Amount (KSH)' } } }
        }
    });
    
    let growth = saccoData.memberGrowth || [];
    if (memberGrowthChart) memberGrowthChart.destroy();
    memberGrowthChart = new Chart(growthCanvas, {
        type: 'line',
        data: {
            labels: growth.map(g => g.month),
            datasets: [{ label: 'Active Members', data: growth.map(g => g.count), borderColor: 'green', fill: true }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });
    
    if (monthlyCanvas) {
        let monthly = saccoData.monthlyFinancials || [];
        if (monthlyPerformanceChart) monthlyPerformanceChart.destroy();
        monthlyPerformanceChart = new Chart(monthlyCanvas, {
            type: 'bar',
            data: {
                labels: monthly.map(m => m.month),
                datasets: [
                    { label: 'Income', data: monthly.map(m => m.income), backgroundColor: 'rgba(54,162,235,0.8)' },
                    { label: 'Expenses', data: monthly.map(m => m.expenses), backgroundColor: 'rgba(255,99,132,0.8)' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    if (loanTypesCanvas) {
        let loanTypeTotals = { DV12: 0, DV18: 0, DV24: 0, DV36: 0, UZ12: 0, UZ24: 0 };
        saccoData.loans.forEach(l => { if (loanTypeTotals[l.type] !== undefined) loanTypeTotals[l.type] += l.amount; });
        if (loanTypesChart) loanTypesChart.destroy();
        loanTypesChart = new Chart(loanTypesCanvas, {
            type: 'pie',
            data: {
                labels: Object.keys(loanTypeTotals),
                datasets: [{ data: Object.values(loanTypeTotals), backgroundColor: ['#ffcd56', '#36a2eb', '#ff6384', '#9966ff', '#4bc0c0', '#ff9f40'] }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
}

// Form Handlers
document.getElementById('memberForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let name = document.getElementById('memberName').value;
    let idNo = document.getElementById('memberIdNumber').value;
    let phone = document.getElementById('memberPhone').value;
    let type = document.getElementById('memberType').value;
    let newMember = { 
        id: saccoData.nextMemberId++, 
        name, idNumber: idNo, phone, type, 
        status: "Active", joinDate: new Date().toISOString() 
    };
    saccoData.members.push(newMember);
    saccoData.savingsTransactions.push({
        id: saccoData.savingsTransactions.length + 1, 
        date: new Date().toISOString(), 
        memberId: newMember.id,
        type: "deposit", amount: 1000, receiptNo: generateReceiptNo(), 
        paymentMode: "Cash", transCode: generateTransCode(), charge: 0
    });
    saveData();
    refreshAll();
    e.target.reset();
    alert(`✅ Member ${name} registered successfully!`);
});

document.getElementById('savingsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let memberId = parseInt(document.getElementById('savingsMember').value);
    let type = document.getElementById('savingsType').value;
    let amount = parseFloat(document.getElementById('savingsAmount').value);
    let mode = document.getElementById('paymentMode').value;
    let charge = (type === 'withdrawal' ? 500 : (type === 'partial_withdrawal' ? 300 : 0));
    saccoData.savingsTransactions.push({
        id: saccoData.savingsTransactions.length + 1, 
        date: new Date().toISOString(), 
        memberId, type, amount,
        receiptNo: generateReceiptNo(), paymentMode: mode, 
        transCode: generateTransCode(), charge
    });
    if (charge > 0) {
        saccoData.expenditures.push({
            id: saccoData.expenditures.length + 1, 
            date: new Date().toISOString(),
            category: "Withdrawal Charges", amount: charge, 
            description: `Charge for ${getMemberName(memberId)}`
        });
    }
    saveData();
    refreshAll();
    e.target.reset();
    alert("Transaction successful!");
});

document.getElementById('loanForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let memberId = parseInt(document.getElementById('loanMember').value);
    let type = document.getElementById('loanType').value;
    let amount = parseFloat(document.getElementById('loanAmount').value);
    let interest = type.includes('UZ') ? 18 : 12;
    let term = parseInt(type.slice(2));
    let totalInterest = amount * (interest / 100);
    let totalRepay = amount + totalInterest;
    let monthly = totalRepay / term;
    let fees = amount * 0.05 + 1500;
    saccoData.loans.push({
        id: saccoData.nextLoanId++, memberId, type, amount, 
        balance: totalRepay, interest, term,
        monthlyInstallment: monthly, disbursementDate: new Date().toISOString(), 
        status: "Active", lateDays: 0, fines: 0
    });
    saccoData.expenditures.push({
        id: saccoData.expenditures.length + 1, 
        date: new Date().toISOString(),
        category: "Loan Fees Income", amount: -fees, 
        description: `Fees for ${getMemberName(memberId)}`
    });
    saveData();
    refreshAll();
    alert(`✅ Loan Approved! Net Disbursement: KSH ${(amount - fees).toLocaleString()}`);
});

document.getElementById('loanPaymentForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let loanId = parseInt(document.getElementById('paymentLoan').value);
    let amount = parseFloat(document.getElementById('paymentAmount').value);
    let mode = document.getElementById('loanPaymentMode').value;
    let loan = saccoData.loans.find(l => l.id === loanId);
    if (!loan || loan.status !== "Active") return alert("Loan not active!");
    let fine = loan.lateDays > 0 ? loan.monthlyInstallment * 0.15 : 0;
    let finePaid = Math.min(fine, amount);
    let principalPaid = Math.min(amount - finePaid, loan.balance);
    loan.balance -= principalPaid;
    loan.fines += finePaid;
    if (loan.balance <= 0) loan.status = "Closed";
    saccoData.loanPayments.push({
        id: saccoData.loanPayments.length + 1, date: new Date().toISOString(), 
        loanId, amount, principalPortion: principalPaid, finePaid, 
        receiptNo: generateReceiptNo(), paymentMode: mode, transCode: generateTransCode()
    });
    saveData();
    refreshAll();
    alert("Payment recorded successfully!");
});

document.getElementById('expenditureForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let category = document.getElementById('expenseCategory').value;
    let amount = parseFloat(document.getElementById('expenseAmount').value);
    let desc = document.getElementById('expenseDesc').value;
    saccoData.expenditures.push({
        id: saccoData.expenditures.length + 1, 
        date: new Date().toISOString(), 
        category, amount, description: desc
    });
    saveData();
    refreshAll();
    e.target.reset();
    alert("Expenditure recorded!");
});

// Member Removal Functions
let memberToRemove = null;

window.showRemoveMemberModal = function(id) {
    let m = saccoData.members.find(m => m.id === id);
    if (m) {
        memberToRemove = m;
        let savings = getMemberSavingsBalance(m.id);
        let loans = saccoData.loans.filter(l => l.memberId === id && l.status === 'Active').reduce((s, l) => s + l.balance, 0);
        document.getElementById('memberDetails').innerHTML = `
            <p><strong>${m.name}</strong> (ID: ${m.id})</p>
            <p>Savings Balance: KSH ${savings.toLocaleString()}</p>
            <p>Active Loan Balance: KSH ${loans.toLocaleString()}</p>
        `;
        document.getElementById('removeMemberModal').style.display = 'block';
    }
};

function closeRemoveModal() {
    document.getElementById('removeMemberModal').style.display = 'none';
    memberToRemove = null;
}

function confirmRemove() {
    if (memberToRemove) {
        let reason = document.getElementById('removalReason').value;
        let withdraw = document.getElementById('processWithdrawal').value;
        let activeLoans = saccoData.loans.filter(l => l.memberId === memberToRemove.id && l.status === 'Active');
        activeLoans.forEach(l => l.status = 'Closed');
        if (withdraw === 'yes') {
            let bal = getMemberSavingsBalance(memberToRemove.id);
            if (bal > 0) {
                let charge = 500;
                saccoData.savingsTransactions.push({
                    id: saccoData.savingsTransactions.length + 1, 
                    date: new Date().toISOString(),
                    memberId: memberToRemove.id, type: "withdrawal", amount: bal, 
                    receiptNo: generateReceiptNo(), paymentMode: "Final Settlement", 
                    transCode: generateTransCode(), charge, description: `Removal: ${reason}`
                });
                saccoData.expenditures.push({
                    id: saccoData.expenditures.length + 1, date: new Date().toISOString(),
                    category: "Withdrawal Charges", amount: charge, 
                    description: `Removal charge - ${memberToRemove.name}`
                });
            }
        }
        memberToRemove.status = "Inactive";
        saveData();
        refreshAll();
        closeRemoveModal();
        alert(`Member ${memberToRemove.name} removed successfully.`);
    }
}

window.reactivateMember = function(id) {
    let m = saccoData.members.find(m => m.id === id);
    if (m && confirm(`Reactivate ${m.name}?`)) {
        m.status = "Active";
        saveData();
        refreshAll();
        alert("Member reactivated!");
    }
};

window.generateStatement = function() {
    let mid = parseInt(document.getElementById('reportMember').value);
    let type = document.getElementById('statementType').value;
    let member = saccoData.members.find(m => m.id === mid);
    if (!member) {
        alert("Please select a member");
        return;
    }
    
    if (type === 'savings') {
        let trans = saccoData.savingsTransactions.filter(t => t.memberId === mid);
        let bal = 0;
        let html = `<h3>Savings Statement: ${member.name}</h3>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead><tr style="background:#f0f0f0;"><th>Date</th><th>Type</th><th>Amount</th><th>Balance</th></tr></thead><tbody>`;
        trans.forEach(t => {
            if (t.type === 'deposit') bal += t.amount;
            else bal -= (t.amount + (t.charge || 0));
            html += `<tr>
                        <td>${new Date(t.date).toLocaleDateString()}</td>
                        <td>${t.type}</td>
                        <td>KSH ${t.amount.toLocaleString()}</td>
                        <td>KSH ${bal.toLocaleString()}</td>
                    </tr>`;
        });
        html += `</tbody></table><h4>Current Balance: KSH ${bal.toLocaleString()}</h4>`;
        document.getElementById('memberStatement').innerHTML = html;
    } else {
        let loans = saccoData.loans.filter(l => l.memberId === mid);
        if (loans.length === 0) {
            document.getElementById('memberStatement').innerHTML = '<p>No loans found for this member.</p>';
        } else {
            let html = `<h3>Loan Statement: ${member.name}</h3>`;
            loans.forEach(loan => {
                let payments = saccoData.loanPayments.filter(p => p.loanId === loan.id);
                let bal = loan.amount;
                html += `<h4>Loan ${loan.type} (Principal: KSH ${loan.amount.toLocaleString()})</h4>
                        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
                            <thead><tr style="background:#f0f0f0;"><th>Date</th><th>Description</th><th>Amount</th><th>Balance</th></tr></thead><tbody>
                            <tr><td>${new Date(loan.disbursementDate).toLocaleDateString()}</td><td>Disbursement</td><td>-</td><td>KSH ${bal.toLocaleString()}</td></tr>`;
                payments.forEach(p => {
                    bal -= p.principalPortion;
                    html += `<tr>
                                <td>${new Date(p.date).toLocaleDateString()}</td>
                                <td>Payment${p.finePaid ? ` (Fine: KSH ${p.finePaid.toLocaleString()})` : ''}</td>
                                <td>KSH ${p.amount.toLocaleString()}</td>
                                <td>KSH ${bal.toLocaleString()}</td>
                            </tr>`;
                });
                html += `<tr style="background:#e0e0e0; font-weight:bold;">
                            <td colspan="3">Outstanding Balance</td>
                            <td>KSH ${loan.balance.toLocaleString()}</td>
                          </tr></tbody></table><br>`;
            });
            document.getElementById('memberStatement').innerHTML = html;
        }
    }
};

window.viewMemberStatement = function(id) {
    document.querySelector('[data-page="reports"]').click();
    document.getElementById('reportMember').value = id;
    generateStatement();
};

function refreshAll() {
    updateDashboard();
    updateMembersList();
    updateSavingsHistory();
    updateLoansList();
    updateExpenditureList();
    updateFinancialStatements();
    updatePARReport();
    updateDropdowns();
    refreshCharts();
    saveData();
}

function updateDate() {
    const dateDiv = document.getElementById('currentDate');
    if (dateDiv) {
        dateDiv.innerText = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }
}

// Navigation
function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const pageId = btn.getAttribute('data-page');
            const page = document.getElementById(pageId);
            if (page) page.classList.add('active');
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) pageTitle.innerText = btn.querySelector('.nav-text').innerText;
        });
    });
}

// Modal Events
document.querySelector('.close-modal')?.addEventListener('click', closeRemoveModal);
document.getElementById('cancelRemoveMember')?.addEventListener('click', closeRemoveModal);
document.getElementById('confirmRemoveMember')?.addEventListener('click', confirmRemove);
window.onclick = function(e) { 
    if (e.target === document.getElementById('removeMemberModal')) closeRemoveModal(); 
};

// Initialize App - Make sure everything runs after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing...");
    initData();
    setupNav();
    refreshAll();
    updateDate();
    setInterval(updateDate, 60000);
    console.log("Initialization complete");
});