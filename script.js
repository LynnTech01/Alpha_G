// Data Storage
let saccoData = {
    members: [],
    savingsTransactions: [],
    loans: [],
    loanPayments: [],
    expenditures: [],
    memberGrowth: [],
    monthlyFinancials: [],
    auditLog: [],
    ledgerEntries: [],
    nextMemberId: 1001,
    nextReceiptNo: 1,
    nextTransCode: 1,
    nextLoanId: 2001
};

// Chart instances
let savingsLoansChart, incomeChart, parChart, memberGrowthChart, monthlyPerformanceChart, loanTypesChart;

// Initialize or load from localStorage
function loadData() {
    const saved = localStorage.getItem('saccoData');
    if (saved) {
        saccoData = JSON.parse(saved);
    } else {
        addSampleData();
        initMemberGrowthTracking();
        updateMonthlyFinancialData();
    }
}

function saveData() {
    localStorage.setItem('saccoData', JSON.stringify(saccoData));
}

function addSampleData() {
    // Sample members
    saccoData.members = [
        { id: 1001, name: "John Doe", idNumber: "12345678", phone: "0712345678", type: "Individual", status: "Active", joinDate: new Date().toISOString(), membershipFeePaid: true },
        { id: 1002, name: "Jane Smith", idNumber: "87654321", phone: "0723456789", type: "CIG", status: "Active", joinDate: new Date().toISOString(), membershipFeePaid: true }
    ];
    
    // Sample savings
    saccoData.savingsTransactions = [
        { id: 1, date: new Date().toISOString(), memberId: 1001, type: "deposit", amount: 10000, receiptNo: "RCP-1", paymentMode: "M-Pesa Deposit", transCode: "TR-1", charge: 0 },
        { id: 2, date: new Date(Date.now() - 86400000).toISOString(), memberId: 1002, type: "deposit", amount: 15000, receiptNo: "RCP-2", paymentMode: "Direct Bank Deposit", transCode: "TR-2", charge: 0 }
    ];
    
    // Sample loans
    saccoData.loans = [
        { id: 2001, memberId: 1001, type: "DV12", amount: 100000, balance: 75000, interest: 12, term: 12, monthlyInstallment: 9333.33, disbursementDate: new Date().toISOString(), status: "Active", lateDays: 5, fines: 0 }
    ];
    
    saccoData.loanPayments = [];
    saccoData.expenditures = [];
    saccoData.nextMemberId = 1003;
    saccoData.nextReceiptNo = 3;
    saccoData.nextTransCode = 3;
    saccoData.nextLoanId = 2002;
}

// Helper Functions
function generateReceiptNo() {
    return `RCP-${saccoData.nextReceiptNo++}`;
}

function generateTransCode() {
    return `TR-${saccoData.nextTransCode++}`;
}

function getMemberName(memberId) {
    const member = saccoData.members.find(m => m.id === memberId);
    return member ? member.name : "Unknown";
}

function getMemberSavingsBalance(memberId) {
    let balance = 0;
    const transactions = saccoData.savingsTransactions.filter(t => t.memberId === memberId);
    
    for (const trans of transactions) {
        if (trans.type === "deposit") {
            balance += trans.amount;
        } else if (trans.type === "withdrawal" || trans.type === "partial_withdrawal") {
            let charge = trans.charge || 0;
            balance -= (trans.amount + charge);
        }
    }
    return balance;
}

// Member Management
function registerMember(event) {
    event.preventDefault();
    
    const name = document.getElementById('memberName').value;
    const idNumber = document.getElementById('memberId').value;
    const phone = document.getElementById('memberPhone').value;
    const type = document.getElementById('memberType').value;
    const membershipFee = 1000;
    
    const newMember = {
        id: saccoData.nextMemberId++,
        name: name,
        idNumber: idNumber,
        phone: phone,
        type: type,
        status: "Active",
        joinDate: new Date().toISOString(),
        membershipFeePaid: true
    };
    
    saccoData.members.push(newMember);
    
    const receiptNo = generateReceiptNo();
    const transCode = generateTransCode();
    
    saccoData.savingsTransactions.push({
        id: saccoData.savingsTransactions.length + 1,
        date: new Date().toISOString(),
        memberId: newMember.id,
        type: "deposit",
        amount: membershipFee,
        receiptNo: receiptNo,
        paymentMode: "Cash",
        transCode: transCode,
        charge: 0,
        description: "Membership Fee"
    });
    
    saveData();
    refreshAllDisplays();
    document.getElementById('memberForm').reset();
    alert(`✅ Member ${name} registered successfully! Membership fee of KSH ${membershipFee} recorded.`);
}

// Savings Transaction
function processSavings(event) {
    event.preventDefault();
    
    const memberId = parseInt(document.getElementById('savingsMember').value);
    const type = document.getElementById('savingsType').value;
    let amount = parseFloat(document.getElementById('savingsAmount').value);
    const paymentMode = document.getElementById('paymentMode').value;
    
    let charge = 0;
    let description = "";
    
    if (type === "withdrawal") {
        charge = 500;
        description = "Membership withdrawal charge";
    } else if (type === "partial_withdrawal") {
        charge = 300;
        description = "Partial withdrawal charge";
    }
    
    const receiptNo = generateReceiptNo();
    const transCode = generateTransCode();
    
    const transaction = {
        id: saccoData.savingsTransactions.length + 1,
        date: new Date().toISOString(),
        memberId: memberId,
        type: type,
        amount: amount,
        receiptNo: receiptNo,
        paymentMode: paymentMode,
        transCode: transCode,
        charge: charge,
        description: description
    };
    
    saccoData.savingsTransactions.push(transaction);
    
    if (charge > 0) {
        saccoData.expenditures.push({
            id: saccoData.expenditures.length + 1,
            date: new Date().toISOString(),
            category: "Withdrawal Charges",
            amount: charge,
            description: description + ` for Member ${getMemberName(memberId)}`
        });
    }
    
    saveData();
    refreshAllDisplays();
    document.getElementById('savingsForm').reset();
    alert(`✅ Transaction processed successfully! Receipt: ${receiptNo}`);
}

// Loan Application
function applyLoan(event) {
    event.preventDefault();
    
    const memberId = parseInt(document.getElementById('loanMember').value);
    const loanType = document.getElementById('loanType').value;
    const amount = parseFloat(document.getElementById('loanAmount').value);
    
    let interest, term;
    if (loanType === "DV12") { interest = 12; term = 12; }
    else if (loanType === "DV18") { interest = 12; term = 18; }
    else if (loanType === "DV24") { interest = 12; term = 24; }
    else if (loanType === "DV36") { interest = 12; term = 36; }
    else if (loanType === "UZ12") { interest = 18; term = 12; }
    else { interest = 18; term = 24; }
    
    const b2cFee = 500;
    const legalFee = 500;
    const fileFee = 500;
    const processingFee = amount * 0.05;
    const insurance = amount * 0.02;
    const totalFees = b2cFee + legalFee + fileFee + processingFee + insurance;
    const netDisbursement = amount - totalFees;
    const totalInterest = amount * (interest / 100);
    const totalRepayment = amount + totalInterest;
    const monthlyInstallment = totalRepayment / term;
    
    const newLoan = {
        id: saccoData.nextLoanId++,
        memberId: memberId,
        type: loanType,
        amount: amount,
        balance: totalRepayment,
        interest: interest,
        term: term,
        monthlyInstallment: monthlyInstallment,
        disbursementDate: new Date().toISOString(),
        status: "Active",
        lateDays: 0,
        fines: 0,
        fees: { b2c: b2cFee, legal: legalFee, file: fileFee, processing: processingFee, insurance: insurance, total: totalFees }
    };
    
    saccoData.loans.push(newLoan);
    
    saccoData.expenditures.push({
        id: saccoData.expenditures.length + 1,
        date: new Date().toISOString(),
        category: "Loan Fees Income",
        amount: -totalFees,
        description: `Loan fees for ${getMemberName(memberId)}`
    });
    
    saveData();
    refreshAllDisplays();
    document.getElementById('loanForm').reset();
    alert(`✅ Loan approved!\nAmount: KSH ${amount.toLocaleString()}\nTotal Fees: KSH ${totalFees.toLocaleString()}\nNet Disbursement: KSH ${netDisbursement.toLocaleString()}\nMonthly Installment: KSH ${monthlyInstallment.toFixed(2)}`);
}

// Loan Payment
function makeLoanPayment(event) {
    event.preventDefault();
    
    const loanId = parseInt(document.getElementById('paymentLoan').value);
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentMode = document.getElementById('loanPaymentMode').value;
    const receiptNo = generateReceiptNo();
    
    const loan = saccoData.loans.find(l => l.id === loanId);
    
    if (!loan || loan.status !== "Active") {
        alert("Loan not found or already closed!");
        return;
    }
    
    let fine = 0;
    if (loan.lateDays > 0) {
        fine = loan.monthlyInstallment * 0.15;
    }
    
    let finePaid = 0;
    if (fine > 0 && paymentAmount >= loan.monthlyInstallment + fine) {
        finePaid = fine;
    } else if (fine > 0) {
        finePaid = paymentAmount > loan.monthlyInstallment ? paymentAmount - loan.monthlyInstallment : 0;
    }
    
    const payment = {
        id: saccoData.loanPayments.length + 1,
        date: new Date().toISOString(),
        loanId: loanId,
        amount: paymentAmount,
        principalPortion: Math.min(paymentAmount - finePaid, loan.balance),
        finePaid: finePaid,
        receiptNo: receiptNo,
        paymentMode: paymentMode,
        transCode: generateTransCode()
    };
    
    loan.balance -= payment.principalPortion;
    loan.fines += finePaid;
    
    if (loan.balance <= 0) {
        loan.status = "Closed";
        loan.balance = 0;
    }
    
    saccoData.loanPayments.push(payment);
    
    saveData();
    refreshAllDisplays();
    document.getElementById('loanPaymentForm').reset();
    alert(`✅ Payment received! Receipt: ${receiptNo}\nFine paid: KSH ${finePaid.toFixed(2)}`);
}

// Record Expenditure
function recordExpenditure(event) {
    event.preventDefault();
    
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDesc').value;
    
    saccoData.expenditures.push({
        id: saccoData.expenditures.length + 1,
        date: new Date().toISOString(),
        category: category,
        amount: amount,
        description: description
    });
    
    saveData();
    refreshAllDisplays();
    document.getElementById('expenditureForm').reset();
    alert("✅ Expenditure recorded successfully!");
}

// Calculate PAR
function calculatePAR() {
    const activeLoans = saccoData.loans.filter(l => l.status === "Active");
    let totalOutstanding = 0;
    let par30 = 0, par60 = 0, par90 = 0;
    
    for (const loan of activeLoans) {
        totalOutstanding += loan.balance;
        if (loan.lateDays > 30) par30 += loan.balance;
        if (loan.lateDays > 60) par60 += loan.balance;
        if (loan.lateDays > 90) par90 += loan.balance;
    }
    
    return {
        totalOutstanding: totalOutstanding,
        par30: totalOutstanding > 0 ? (par30 / totalOutstanding) * 100 : 0,
        par60: totalOutstanding > 0 ? (par60 / totalOutstanding) * 100 : 0,
        par90: totalOutstanding > 0 ? (par90 / totalOutstanding) * 100 : 0,
        par30Amount: par30,
        par60Amount: par60,
        par90Amount: par90
    };
}

// Generate Financial Statements
function generateTrialBalance() {
    let totalDebits = 0;
    let totalCredits = 0;
    const accounts = {};
    
    for (const member of saccoData.members) {
        const balance = getMemberSavingsBalance(member.id);
        if (balance > 0) {
            accounts[`Savings - ${member.name}`] = { debit: balance, credit: 0 };
            totalDebits += balance;
        }
    }
    
    for (const loan of saccoData.loans) {
        if (loan.balance > 0) {
            accounts[`Loan - ${getMemberName(loan.memberId)}`] = { debit: loan.balance, credit: 0 };
            totalDebits += loan.balance;
        }
    }
    
    let totalIncome = 0;
    for (const exp of saccoData.expenditures) {
        if (exp.amount < 0) {
            totalIncome += Math.abs(exp.amount);
        }
    }
    if (totalIncome > 0) {
        accounts["Loan Fee Income"] = { debit: 0, credit: totalIncome };
        totalCredits += totalIncome;
    }
    
    let totalExpenses = 0;
    for (const exp of saccoData.expenditures) {
        if (exp.amount > 0) {
            totalExpenses += exp.amount;
        }
    }
    if (totalExpenses > 0) {
        accounts["Operating Expenses"] = { debit: totalExpenses, credit: 0 };
        totalDebits += totalExpenses;
    }
    
    return { accounts, totalDebits, totalCredits };
}

// Chart Functions
function initMemberGrowthTracking() {
    if (!saccoData.memberGrowth || saccoData.memberGrowth.length === 0) {
        saccoData.memberGrowth = [];
        const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
        saccoData.memberGrowth.push({
            month: currentMonth,
            count: saccoData.members.filter(m => m.status === 'Active').length,
            newJoins: saccoData.members.length
        });
        saveData();
    }
}

function updateMemberGrowth() {
    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    const activeCount = saccoData.members.filter(m => m.status === 'Active').length;
    
    const existingEntry = saccoData.memberGrowth.find(entry => entry.month === currentMonth);
    if (existingEntry) {
        existingEntry.count = activeCount;
    } else {
        saccoData.memberGrowth.push({
            month: currentMonth,
            count: activeCount,
            newJoins: saccoData.members.length
        });
    }
    saveData();
}

function updateMonthlyFinancialData() {
    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (!saccoData.monthlyFinancials) {
        saccoData.monthlyFinancials = [];
    }
    
    const totalIncome = saccoData.expenditures.reduce((sum, e) => sum + (e.amount < 0 ? Math.abs(e.amount) : 0), 0);
    const totalExpenses = saccoData.expenditures.reduce((sum, e) => sum + (e.amount > 0 ? e.amount : 0), 0);
    
    const existingEntry = saccoData.monthlyFinancials.find(entry => entry.month === currentMonth);
    if (existingEntry) {
        existingEntry.income = totalIncome;
        existingEntry.expenses = totalExpenses;
        existingEntry.profit = totalIncome - totalExpenses;
    } else {
        saccoData.monthlyFinancials.push({
            month: currentMonth,
            income: totalIncome,
            expenses: totalExpenses,
            profit: totalIncome - totalExpenses,
            savings: saccoData.members.reduce((sum, m) => sum + getMemberSavingsBalance(m.id), 0),
            loans: saccoData.loans.reduce((sum, l) => sum + l.balance, 0),
            members: saccoData.members.filter(m => m.status === 'Active').length
        });
    }
    saveData();
}

function createSavingsLoansChart() {
    const totalSavings = saccoData.members.reduce((sum, m) => sum + getMemberSavingsBalance(m.id), 0);
    const totalLoansOutstanding = saccoData.loans.reduce((sum, l) => sum + (l.status === "Active" ? l.balance : 0), 0);
    const totalLoansDisbursed = saccoData.loans.reduce((sum, l) => sum + l.amount, 0);
    
    const ctx = document.getElementById('savingsLoansChart').getContext('2d');
    if (savingsLoansChart) savingsLoansChart.destroy();
    
    savingsLoansChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Savings', 'Loans Outstanding', 'Total Disbursed'],
            datasets: [{
                label: 'Amount (KSH)',
                data: [totalSavings, totalLoansOutstanding, totalLoansDisbursed],
                backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(75, 192, 192, 0.8)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: (ctx) => 'KSH ' + ctx.raw.toLocaleString() } } },
            scales: { y: { beginAtZero: true, ticks: { callback: (v) => 'KSH ' + v.toLocaleString() } } }
        }
    });
}

function createIncomeChart() {
    const loanFees = saccoData.expenditures.reduce((sum, e) => sum + (e.amount < 0 && e.category === 'Loan Fees Income' ? Math.abs(e.amount) : 0), 0);
    const withdrawalCharges = saccoData.expenditures.reduce((sum, e) => sum + (e.amount > 0 && e.category === 'Withdrawal Charges' ? e.amount : 0), 0);
    const otherIncome = saccoData.expenditures.reduce((sum, e) => sum + (e.amount < 0 && e.category !== 'Loan Fees Income' ? Math.abs(e.amount) : 0), 0);
    
    const ctx = document.getElementById('incomeChart').getContext('2d');
    if (incomeChart) incomeChart.destroy();
    
    incomeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Loan Fees', 'Withdrawal Charges', 'Other Income'],
            datasets: [{ data: [loanFees, withdrawalCharges, otherIncome], backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)'] }]
        },
        options: {
            responsive: true,
            plugins: { tooltip: { callbacks: { label: (ctx) => { const total = ctx.dataset.data.reduce((a,b)=>a+b,0); const pct = ((ctx.raw/total)*100).toFixed(1); return `${ctx.label}: KSH ${ctx.raw.toLocaleString()} (${pct}%)`; } } } }
        }
    });
}

function createPARChart() {
    const par = calculatePAR();
    const ctx = document.getElementById('parChart').getContext('2d');
    if (parChart) parChart.destroy();
    
    parChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['>30 Days', '>60 Days', '>90 Days'],
            datasets: [
                { label: 'PAR Percentage (%)', data: [par.par30, par.par60, par.par90], borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)', tension: 0.4, fill: true, yAxisID: 'y' },
                { label: 'Amount (KSH)', data: [par.par30Amount, par.par60Amount, par.par90Amount], borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0.4, fill: true, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            scales: { y: { title: { display: true, text: 'Percentage (%)' }, beginAtZero: true, max: 100 }, y1: { position: 'right', title: { display: true, text: 'Amount (KSH)' }, beginAtZero: true, ticks: { callback: (v) => 'KSH ' + v.toLocaleString() } } }
        }
    });
}

function createMemberGrowthChart() {
    const growth = saccoData.memberGrowth || [];
    const ctx = document.getElementById('memberGrowthChart').getContext('2d');
    if (memberGrowthChart) memberGrowthChart.destroy();
    
    memberGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: growth.map(g => g.month),
            datasets: [
                { label: 'Active Members', data: growth.map(g => g.count), borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', tension: 0.4, fill: true },
                { label: 'New Joins', data: growth.map(g => g.newJoins), borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)', tension: 0.4, fill: true }
            ]
        },
        options: { responsive: true }
    });
}

function createMonthlyPerformanceChart() {
    const financials = saccoData.monthlyFinancials || [];
    const ctx = document.getElementById('monthlyPerformanceChart').getContext('2d');
    if (monthlyPerformanceChart) monthlyPerformanceChart.destroy();
    
    monthlyPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: financials.map(f => f.month),
            datasets: [
                { label: 'Income', data: financials.map(f => f.income), backgroundColor: 'rgba(54, 162, 235, 0.8)' },
                { label: 'Expenses', data: financials.map(f => f.expenses), backgroundColor: 'rgba(255, 99, 132, 0.8)' },
                { label: 'Profit', data: financials.map(f => f.profit), type: 'line', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 2, fill: false, tension: 0.4 }
            ]
        },
        options: { responsive: true, scales: { y: { ticks: { callback: (v) => 'KSH ' + v.toLocaleString() } } } }
    });
}

function createLoanTypesChart() {
    const loanTypes = { 'DV12': 0, 'DV18': 0, 'DV24': 0, 'DV36': 0, 'UZ12': 0, 'UZ24': 0 };
    saccoData.loans.forEach(loan => { if (loanTypes[loan.type] !== undefined) loanTypes[loan.type] += loan.amount; });
    
    const ctx = document.getElementById('loanTypesChart').getContext('2d');
    if (loanTypesChart) loanTypesChart.destroy();
    
    loanTypesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(loanTypes),
            datasets: [{ data: Object.values(loanTypes), backgroundColor: ['rgba(255,99,132,0.8)','rgba(54,162,235,0.8)','rgba(255,206,86,0.8)','rgba(75,192,192,0.8)','rgba(153,102,255,0.8)','rgba(255,159,64,0.8)'] }]
        },
        options: { responsive: true, plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: (ctx) => { const total = ctx.dataset.data.reduce((a,b)=>a+b,0); const pct = ((ctx.raw/total)*100).toFixed(1); return `${ctx.label}: KSH ${ctx.raw.toLocaleString()} (${pct}%)`; } } } } }
    });
}

// Update Displays
function updateDashboard() {
    const totalMembers = saccoData.members.filter(m => m.status === 'Active').length;
    const totalSavings = saccoData.members.reduce((sum, m) => sum + getMemberSavingsBalance(m.id), 0);
    const totalLoansOutstanding = saccoData.loans.reduce((sum, l) => sum + (l.status === "Active" ? l.balance : 0), 0);
    const totalIncome = saccoData.expenditures.reduce((sum, e) => sum + (e.amount < 0 ? Math.abs(e.amount) : 0), 0);
    
    document.getElementById('dashboardStats').innerHTML = `
        <div class="stat-card" onclick="showMemberList()"><h3>👥 Total Active Members</h3><div class="stat-number">${totalMembers}</div></div>
        <div class="stat-card" onclick="showSavingsReport()"><h3>💰 Total Savings</h3><div class="stat-number">KSH ${totalSavings.toLocaleString()}</div></div>
        <div class="stat-card" onclick="showLoansReport()"><h3>📈 Loans Outstanding</h3><div class="stat-number">KSH ${totalLoansOutstanding.toLocaleString()}</div></div>
        <div class="stat-card" onclick="showIncomeReport()"><h3>💵 Total Income</h3><div class="stat-number">KSH ${totalIncome.toLocaleString()}</div></div>
    `;
}

function updateRecentTransactions() {
    const allTransactions = [];
    saccoData.savingsTransactions.forEach(t => { allTransactions.push({ date: new Date(t.date), type: t.type === 'deposit' ? 'Savings Deposit' : 'Savings Withdrawal', amount: t.amount, member: getMemberName(t.memberId), color: t.type === 'deposit' ? 'deposit' : 'withdrawal' }); });
    saccoData.loanPayments.forEach(p => { const loan = saccoData.loans.find(l => l.id === p.loanId); if (loan) allTransactions.push({ date: new Date(p.date), type: 'Loan Payment', amount: p.amount, member: getMemberName(loan.memberId), color: 'loan' }); });
    allTransactions.sort((a,b) => b.date - a.date);
    const recent = allTransactions.slice(0, 10);
    
    document.getElementById('recentTransactions').innerHTML = `<div class="transactions-list">${recent.map(t => `<div class="transaction-item"><div><strong>${t.member}</strong><br><small>${t.date.toLocaleDateString()}</small></div><div><span class="transaction-type ${t.color}">${t.type}</span><strong style="margin-left:1rem;color:${t.type.includes('Withdrawal')?'#dc3545':'#28a745'}">${t.type.includes('Withdrawal')?'-':'+'} KSH ${t.amount.toLocaleString()}</strong></div></div>`).join('')}${allTransactions.length===0?'<p>No transactions yet.</p>':''}</div>`;
}

function updateMembersList() {
    document.getElementById('membersList').innerHTML = saccoData.members.map(m => `<tr><td>${m.id}</td><td>${m.name}</td><td>${m.phone}</td><td>${m.type}</td><td>KSH ${getMemberSavingsBalance(m.id).toLocaleString()}</td><td>KSH ${saccoData.loans.filter(l=>l.memberId===m.id && l.status==="Active").reduce((s,l)=>s+l.balance,0).toLocaleString()}</td><td><span class="member-status-${m.status==='Active'?'active':'inactive'}">${m.status}</span></td><td><button onclick="viewMemberStatement(${m.id})" class="btn btn-primary" style="padding:0.25rem 0.5rem;margin-right:0.5rem;">Statement</button>${m.status==='Active'?`<button onclick="showRemoveMemberModal(${m.id})" class="btn btn-danger" style="padding:0.25rem 0.5rem;">Remove</button>`:`<button onclick="reactivateMember(${m.id})" class="btn" style="padding:0.25rem 0.5rem;background:#28a745;color:white;">Reactivate</button>`}</td></tr>`).join('');
}

function updateSavingsHistory() {
    document.getElementById('savingsHistory').innerHTML = saccoData.savingsTransactions.slice().reverse().map(t => `<tr><td>${new Date(t.date).toLocaleDateString()}</td><td>${getMemberName(t.memberId)}</td><td>${t.type}</td><td>KSH ${t.amount.toLocaleString()}</td><td>${t.receiptNo}</td><td>${t.paymentMode}</td><td>${t.transCode}</td></tr>`).join('');
}

function updateLoansList() {
    document.getElementById('loansList').innerHTML = saccoData.loans.map(l => `<tr><td>${l.id}</td><td>${getMemberName(l.memberId)}</td><td>${l.type}</td><td>KSH ${l.amount.toLocaleString()}</td><td>KSH ${l.balance.toLocaleString()}</td><td>KSH ${l.monthlyInstallment.toFixed(2)}</td><td>${l.lateDays}</td><td>KSH ${l.fines.toFixed(2)}</td><td><span style="color:${l.status==='Active'?'green':'gray'}">${l.status}</span></td></tr>`).join('');
}

function updateExpenditureList() {
    document.getElementById('expenditureList').innerHTML = saccoData.expenditures.slice().reverse().map(e => `<tr><td>${new Date(e.date).toLocaleDateString()}</td><td>${e.category}</td><td>KSH ${Math.abs(e.amount).toLocaleString()}</td><td>${e.description || '-'}</td></tr>`).join('');
}

function updateFinancialStatements() {
    const { accounts, totalDebits, totalCredits } = generateTrialBalance();
    document.getElementById('trialBalance').innerHTML = `<div class="financial-table"><table><thead><tr><th>Account</th><th>Debit (KSH)</th><th>Credit (KSH)</th></tr></thead><tbody>${Object.entries(accounts).map(([acc,amt]) => `<tr><td>${acc}</td><td>${amt.debit>0?'KSH '+amt.debit.toLocaleString():'-'}</td><td>${amt.credit>0?'KSH '+amt.credit.toLocaleString():'-'}</td></tr>`).join('')}<tr class="total-row"><td><strong>TOTAL</strong></td><td><strong>KSH ${totalDebits.toLocaleString()}</strong></td><td><strong>KSH ${totalCredits.toLocaleString()}</strong></td></tr></tbody></table></div>`;
    
    let totalIncome = 0, totalExpenses = 0;
    saccoData.expenditures.forEach(e => { if(e.amount<0) totalIncome+=Math.abs(e.amount); else if(e.amount>0) totalExpenses+=e.amount; });
    document.getElementById('incomeStatement').innerHTML = `<div class="financial-table"><table><tr><td><strong>Income from Loan Fees</strong></td><td>KSH ${totalIncome.toLocaleString()}</td></tr><tr><td><strong>Less: Operating Expenses</strong></td><td>KSH ${totalExpenses.toLocaleString()}</td></tr><tr class="total-row"><td><strong>Net Income</strong></td><td><strong>KSH ${(totalIncome-totalExpenses).toLocaleString()}</strong></td></tr></table></div>`;
    
    const totalAssets = saccoData.members.reduce((s,m)=>s+getMemberSavingsBalance(m.id),0) + saccoData.loans.reduce((s,l)=>s+l.balance,0);
    document.getElementById('balanceSheet').innerHTML = `<div class="financial-table"><table><tr><td><strong>ASSETS</strong></td><td></td></tr><tr><td style="padding-left:1rem;">Cash & Bank</td><td>KSH ${totalAssets.toLocaleString()}</td></tr><tr><td style="padding-left:1rem;">Loans Receivable</td><td>KSH ${saccoData.loans.reduce((s,l)=>s+l.balance,0).toLocaleString()}</td></tr><tr class="total-row"><td><strong>Total Assets</strong></td><td><strong>KSH ${totalAssets.toLocaleString()}</strong></td></tr><tr><td><strong>LIABILITIES & EQUITY</strong></td><td></td></tr><tr><td style="padding-left:1rem;">Members' Savings</td><td>KSH ${saccoData.members.reduce((s,m)=>s+getMemberSavingsBalance(m.id),0).toLocaleString()}</td></tr><tr class="total-row"><td><strong>Total Equity</strong></td><td><strong>KSH ${totalAssets.toLocaleString()}</strong></td></tr></table></div>`;
}

function updateLedger() {
    const ledgerEntries = [];
    let balance = 0;
    saccoData.savingsTransactions.forEach(t => { balance += t.type==="deposit"?t.amount:-t.amount; ledgerEntries.push({ date: new Date(t.date), account: "Savings Account", description: `${t.type.toUpperCase()} - ${getMemberName(t.memberId)}`, debit: t.type==="deposit"?t.amount:0, credit: t.type!=="deposit"?t.amount:0, balance: balance }); });
    ledgerEntries.sort((a,b)=>a.date-b.date);
    document.getElementById('ledgerEntries').innerHTML = ledgerEntries.map(e => `<tr><td>${e.date.toLocaleDateString()}</td><td>${e.account}</td><td>${e.description}</td><td>${e.debit>0?'KSH '+e.debit.toLocaleString():'-'}</td><td>${e.credit>0?'KSH '+e.credit.toLocaleString():'-'}</td><td>KSH ${e.balance.toLocaleString()}</td></tr>`).join('');
}

function updatePARReport() {
    const par = calculatePAR();
    document.getElementById('parReport').innerHTML = `<div class="par-container"><div class="par-card"><h4>> 30 Days Past Due</h4><div class="par-value">KSH ${par.par30Amount.toLocaleString()}</div><div>${par.par30.toFixed(2)}% of Portfolio</div></div><div class="par-card"><h4>> 60 Days Past Due</h4><div class="par-value">KSH ${par.par60Amount.toLocaleString()}</div><div>${par.par60.toFixed(2)}% of Portfolio</div></div><div class="par-card"><h4>> 90 Days Past Due</h4><div class="par-value">KSH ${par.par90Amount.toLocaleString()}</div><div>${par.par90.toFixed(2)}% of Portfolio</div></div></div><div class="par-container" style="margin-top:1rem;"><div class="par-card"><h4>Total Outstanding Portfolio</h4><div class="par-value">KSH ${par.totalOutstanding.toLocaleString()}</div></div></div>`;
}

function updateDropdowns() {
    ['savingsMember', 'loanMember', 'reportMember'].forEach(id => { const select = document.getElementById(id); if(select) select.innerHTML = saccoData.members.filter(m=>m.status==='Active').map(m => `<option value="${m.id}">${m.name} (${m.id})</option>`).join(''); });
    const paymentLoanSelect = document.getElementById('paymentLoan');
    if(paymentLoanSelect) paymentLoanSelect.innerHTML = saccoData.loans.filter(l=>l.status==="Active").map(l => `<option value="${l.id}">${getMemberName(l.memberId)} - ${l.type} (Balance: KSH ${l.balance.toLocaleString()})</option>`).join('');
}

function refreshAllCharts() {
    createSavingsLoansChart();
    createIncomeChart();
    createPARChart();
    createMemberGrowthChart();
    createMonthlyPerformanceChart();
    createLoanTypesChart();
}

function refreshAllDisplays() {
    updateDashboard();
    updateMembersList();
    updateSavingsHistory();
    updateLoansList();
    updateExpenditureList();
    updateFinancialStatements();
    updateLedger();
    updateDropdowns();
    updatePARReport();
    updateRecentTransactions();
    refreshAllCharts();
    updateMemberGrowth();
    updateMonthlyFinancialData();
}

// Member Removal Functions
let memberToRemove = null;

function showRemoveMemberModal(memberId) {
    const member = saccoData.members.find(m => m.id === memberId);
    if (!member) return;
    memberToRemove = member;
    const savingsBalance = getMemberSavingsBalance(member.id);
    const loans = saccoData.loans.filter(l => l.memberId === member.id && l.status === "Active");
    const totalLoanBalance = loans.reduce((sum, l) => sum + l.balance, 0);
    document.getElementById('memberDetails').innerHTML = `<p><strong>Name:</strong> ${member.name}</p><p><strong>ID:</strong> ${member.idNumber}</p><p><strong>Type:</strong> ${member.type}</p><p><strong>Current Savings Balance:</strong> KSH ${savingsBalance.toLocaleString()}</p><p><strong>Active Loan Balance:</strong> KSH ${totalLoanBalance.toLocaleString()}</p><p><strong>Status:</strong> ${member.status}</p>`;
    document.getElementById('removeMemberModal').style.display = 'block';
}

function closeRemoveMemberModal() {
    document.getElementById('removeMemberModal').style.display = 'none';
    memberToRemove = null;
}

function confirmRemoveMember() {
    if (!memberToRemove) return;
    const removalReason = document.getElementById('removalReason').value;
    const processWithdrawal = document.getElementById('processWithdrawal').value;
    const activeLoans = saccoData.loans.filter(l => l.memberId === memberToRemove.id && l.status === "Active");
    
    if (activeLoans.length > 0 && !confirm(`This member has ${activeLoans.length} active loan(s) totaling KSH ${activeLoans.reduce((sum, l) => sum + l.balance, 0).toLocaleString()}. Close all loans and proceed?`)) return;
    
    activeLoans.forEach(loan => { loan.status = "Closed"; loan.closedDate = new Date().toISOString(); });
    
    if (processWithdrawal === 'yes') {
        const savingsBalance = getMemberSavingsBalance(memberToRemove.id);
        if (savingsBalance > 0) {
            const withdrawalCharge = 500;
            saccoData.savingsTransactions.push({ id: saccoData.savingsTransactions.length + 1, date: new Date().toISOString(), memberId: memberToRemove.id, type: "withdrawal", amount: savingsBalance, receiptNo: generateReceiptNo(), paymentMode: "Final Settlement", transCode: generateTransCode(), charge: withdrawalCharge, description: `Final withdrawal due to member removal - ${removalReason}` });
            saccoData.expenditures.push({ id: saccoData.expenditures.length + 1, date: new Date().toISOString(), category: "Withdrawal Charges", amount: withdrawalCharge, description: `Member removal withdrawal charge - ${memberToRemove.name}` });
        }
    }
    
    memberToRemove.status = "Inactive";
    memberToRemove.removalDate = new Date().toISOString();
    memberToRemove.removalReason = removalReason;
    saveData();
    refreshAllDisplays();
    closeRemoveMemberModal();
    alert(`✅ Member ${memberToRemove.name} has been removed successfully.`);
}

function reactivateMember(memberId) {
    const member = saccoData.members.find(m => m.id === memberId);
    if (member && confirm(`Reactivate member ${member.name}?`)) {
        member.status = "Active";
        delete member.removalDate;
        delete member.removalReason;
        saveData();
        refreshAllDisplays();
        alert(`✅ Member ${member.name} has been reactivated.`);
    }
}

function generateStatement() {
    const memberId = parseInt(document.getElementById('reportMember').value);
    const statementType = document.getElementById('statementType').value;
    const member = saccoData.members.find(m => m.id === memberId);
    if (!member) { alert("Please select a member"); return; }
    
    let html = `<div class="statement-container"><h3>${statementType === 'savings' ? 'Savings' : 'Loan'} Statement for ${member.name}</h3>`;
    
    if (statementType === 'savings') {
        const transactions = saccoData.savingsTransactions.filter(t => t.memberId === memberId);
        let balance = 0;
        html += '<table><thead><tr><th>Date</th><th>Description</th><th>Deposit</th><th>Withdrawal</th><th>Balance</th></tr></thead><tbody>';
        transactions.forEach(t => {
            if (t.type === "deposit") { balance += t.amount; html += `<tr><td>${new Date(t.date).toLocaleDateString()}</td><td>Savings Deposit</td><td>KSH ${t.amount.toLocaleString()}</td><td>-</td><td>KSH ${balance.toLocaleString()}</td></tr>`; }
            else { balance -= (t.amount + (t.charge || 0)); html += `<tr><td>${new Date(t.date).toLocaleDateString()}</td><td>${t.type} (Fee: KSH ${(t.charge || 0).toLocaleString()})</td><td>-</td><td>KSH ${t.amount.toLocaleString()}</td><td>KSH ${balance.toLocaleString()}</td></tr>`; }
        });
        html += `<tr class="total-row"><td colspan="4"><strong>Current Balance</strong></td><td><strong>KSH ${balance.toLocaleString()}</strong></td></tr></tbody>`;
    } else {
        const memberLoans = saccoData.loans.filter(l => l.memberId === memberId);
        memberLoans.forEach(loan => {
            const payments = saccoData.loanPayments.filter(p => p.loanId === loan.id);
            let balance = loan.amount;
            html += `<h4>Loan ${loan.type} - KSH ${loan.amount.toLocaleString()}</h4>`;
            html += '<table><thead><tr><th>Date</th><th>Description</th><th>Payment</th><th>Balance</th></tr></thead><tbody>';
            html += `<tr><td>${new Date(loan.disbursementDate).toLocaleDateString()}</td><td>Loan Disbursement</td><td>-</td><td>KSH ${balance.toLocaleString()}</td></tr>`;
            payments.forEach(p => { balance -= p.principalPortion; html += `<tr><td>${new Date(p.date).toLocaleDateString()}</td><td>Loan Payment${p.finePaid>0 ? ' (Fine: KSH ' + p.finePaid.toLocaleString() + ')' : ''}</td><td>KSH ${p.amount.toLocaleString()}</td><td>KSH ${balance.toLocaleString()}</td></tr>`; });
            html += `<tr class="total-row"><td colspan="3"><strong>Outstanding Balance</strong></td><td><strong>KSH ${loan.balance.toLocaleString()}</strong></td></tr></tbody><br>`;
        });
    }
    html += '</div>';
    document.getElementById('memberStatement').innerHTML = html;
}

function viewMemberStatement(memberId) {
    document.querySelector('[data-page="reports"]').click();
    document.getElementById('reportMember').value = memberId;
    generateStatement();
}

function showMemberList() { document.querySelector('[data-page="members"]').click(); }
function showSavingsReport() { document.querySelector('[data-page="savings"]').click(); }
function showLoansReport() { document.querySelector('[data-page="loans"]').click(); }
function showIncomeReport() { document.querySelector('[data-page="financial"]').click(); }

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.getAttribute('data-page');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            document.getElementById('pageTitle').innerText = btn.querySelector('.nav-text').innerText;
        });
    });
}

function setupModalEvents() {
    const modal = document.getElementById('removeMemberModal');
    document.querySelector('.close-modal')?.addEventListener('click', closeRemoveMemberModal);
    document.getElementById('cancelRemoveMember')?.addEventListener('click', closeRemoveMemberModal);
    document.getElementById('confirmRemoveMember')?.addEventListener('click', confirmRemoveMember);
    window.onclick = (event) => { if (event.target === modal) closeRemoveMemberModal(); };
}

function updateDate() {
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Initialize
function init() {
    loadData();
    setupNavigation();
    setupModalEvents();
    updateDate();
    setInterval(updateDate, 60000);
    
    document.getElementById('memberForm')?.addEventListener('submit', registerMember);
    document.getElementById('savingsForm')?.addEventListener('submit', processSavings);
    document.getElementById('loanForm')?.addEventListener('submit', applyLoan);
    document.getElementById('loanPaymentForm')?.addEventListener('submit', makeLoanPayment);
    document.getElementById('expenditureForm')?.addEventListener('submit', recordExpenditure);
    
    refreshAllDisplays();
}

init();