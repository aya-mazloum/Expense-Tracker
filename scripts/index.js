const date = document.getElementById('date');
const balanceSpan = document.getElementById('balance');
const transTab = document.getElementById('transactionsTab');
const newTransTab = document.getElementById('newTransactionTab');
const transactionsContainer = document.getElementById('transactionsContainer');
const newTransactionContainer = document.getElementById('newTransactionContainer');
const transCardsContainer = document.getElementById('transCardsContainer');
const currenciesDropdown = document.querySelectorAll('.currencies-select');
const addTransactionBtn = document.getElementById('addTransaction');
const requiredNote = document.getElementById('requiredNote');
const successNote = document.getElementById('successNote');
const transactionType = document.getElementById('transactionType');
const amountFromInput = document.getElementById('amountFrom');
const amountToInput = document.getElementById('amountTo');
const filterCurrenciesDropdown = document.getElementById('currencies');



let balance = 415;
localStorage.getItem('balance') == null ? localStorage.setItem('balance', balance) : balance = localStorage.getItem('balance');

let transactions = [
    {
        type: 'income',
        title: 'Salary',
        amount: '900',
        currency: 'USD'
    },
    {
        type: 'expense',
        title: 'Food & drinks',
        amount: '33',
        currency: 'USD'
    },
    {
        type: 'expense',
        title: 'Netflix subscription',
        amount: '22000',
        currency: 'LBP'
    },
    {
        type: 'expense',
        title: 'Shopping',
        amount: '100000',
        currency: 'LBP'
    },
    {
        type: 'income',
        title: 'Transfer from dad',
        amount: '50',
        currency: 'EUR'
    }
];

localStorage.getItem('transactions') == null ? localStorage.setItem('transactions', JSON.stringify(transactions)) : transactions = JSON.parse(localStorage.getItem('transactions'));

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
date.innerHTML = formattedDate;




function calculateBalance(type, amount, currency) {
    if (amount == 0) {
        balanceSpan.innerHTML = balance;
        return;
    }

    amount = Number(amount);
    
    if (currency === 'USD') {
        type === 'icncome' ? balance = Number(balance) + amount : balance = Number(balance) - amount;
        
        localStorage.setItem('balance', balance);
        balanceSpan.innerHTML = balance;
        successNote.classList.remove('hide');
        return;
    }
    
    // tried to use only FormData but didn't work, it worked using headers and raw
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "from": currency,
        "to": "USD",
        "amount": amount
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    const result = fetch('https://dull-pink-sockeye-tie.cyclic.app/students/convert', requestOptions);

    result.then((response) => response.json())
        .then((convertedAmount) => {
            type === 'income' ? balance = Number(Number(balance) + Number(convertedAmount)).toFixed(2) :
                balance = Number(Number(balance) - Number(convertedAmount)).toFixed(2);

            localStorage.setItem('balance', balance);
            balanceSpan.innerHTML = balance;

            successNote.classList.remove('hide');
        }).catch(error => {
            console.error('Error:', error.response || error.message || error);
    });
}

function addTransaction() {
    requiredNote.classList.add('hide');
    successNote.classList.add('hide');

    const type = document.getElementById('newTransactionType').value;
    const title = document.getElementById('newTransactionTitle').value;
    const amount = document.getElementById('newTransactionAmount').value;
    const currency = document.getElementById('newTransCurrencies').value;

    if (title == '' || amount == '') {
        requiredNote.classList.remove('hide');
        return;
    }

    const newTrans = {
        type: type,
        title: title,
        amount: amount,
        currency: currency
    };

    transactions.push(newTrans);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    calculateBalance(type, amount, currency);
    loadTransactions();
};

function toggleTabs() {
    transTab.classList.toggle('active');
    newTransTab.classList.toggle('active');
    transactionsContainer.classList.toggle('hide');
    newTransactionContainer.classList.toggle('hide');
}

const loadCurrencies = async () => {
    try {
        const { data } = await axios.get("https://dull-pink-sockeye-tie.cyclic.app/students/available");

        currenciesDropdown.forEach((dropdown) => {
            data.forEach((currency) => {
                dropdown.innerHTML += `<option value="${currency.code}">${currency.code}</option>`;
            })
        })
    } catch (error) {
        console.error('Error:', error.response || error.message || error);
    }
};

function generateTransCard(type, title, amount, currency) {
    if (type == 'income')
        transCardsContainer.innerHTML +=
            `<div class="trans-card flex row center">
                <img src="./assets/icons/icons8-income-60.png" alt="income-icon" />
                <div class="trans-text flex column">
                    <h4>Income</h4>
                    <p class="trans-title small">${title}</p>
                </div>
                <div class="trans-amount small">${amount} ${currency}</div>
            </div>`;
    else
        transCardsContainer.innerHTML +=
            `<div class="trans-card flex row center">
                <img src="./assets/icons/icons8-expense-60.png" alt="expense-icon" />
                <div class="trans-text flex column">
                    <h4>Expense</h4>
                    <p class="trans-title small">${title}</p>
                </div>
                <div class="trans-amount small">${amount} ${currency}</div>
            </div>`;
}

function filterTransactions(ftype, famountFrom, famountTo, fselectedCurrencies) {
    if(Array.isArray(transactions))
        return transactions.filter(transaction => {
            return (
                (ftype === 'all' || transaction.type === ftype) &&
                (!famountFrom || transaction.amount >= Number(famountFrom)) &&
                (!famountTo || transaction.amount <= Number(famountTo)) &&
                (fselectedCurrencies.length === 0 || fselectedCurrencies.includes('all') 
                    || fselectedCurrencies.includes(transaction.currency))
            );
        });
}

function loadTransactions() {
    transCardsContainer.innerHTML = '';
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const ftype = transactionType.value;
    const famountFrom = amountFromInput.value;
    const famountTo = amountToInput.value;
    const fselectedCurrencies = Array.from(filterCurrenciesDropdown.selectedOptions).map(option => option.value);

    transactions = filterTransactions(ftype, famountFrom, famountTo, fselectedCurrencies) || [];

    transactions.forEach(trans => {
        const { type, title, amount, currency } = trans;
        generateTransCard(type, title, amount, currency);
    });
}


calculateBalance('income', 0, 'USD');
loadCurrencies();
loadTransactions();



transTab.addEventListener('click', () => { toggleTabs(); });

newTransTab.addEventListener('click', () => { toggleTabs(); });

transactionType.addEventListener('change', () => { loadTransactions(); });
amountFromInput.addEventListener('input', () => { loadTransactions(); });
amountToInput.addEventListener('input', () => { loadTransactions(); });
filterCurrenciesDropdown.addEventListener('change', () => { loadTransactions(); });

addTransactionBtn.addEventListener('click', () => { addTransaction(); });