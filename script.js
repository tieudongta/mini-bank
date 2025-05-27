//Class Account
class Account {
  #balance;
  #interestRate;
  #interest;
  #transactions;
  #history;

  constructor(balance = 0, interestRate = 0.045) {
    this.#balance = balance;
    this.#interestRate = interestRate;
    this.#interest = 0;
    this.#transactions = 0;
    this.#history = [];
  }

  setInterestRate(rate) {
    this.#interestRate = rate;
  }

  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
      this.#transactions++;
      this.#history.push(`Deposited $${amount}`);
    } else {
      throw new Error("Deposit must be a positive amount.");
    }
  }

  withdraw(amount) {
    if (amount <= this.#balance) {
      this.#balance -= amount;
      this.#transactions++;
      this.#history.push(`Withdrew $${amount}`);
    } else {
      throw new Error("Insufficient funds.");
    }
  }

  calcInterest() {
    this.#interest = this.#balance * this.#interestRate;
    this.#balance += this.#interest;
    this.#history.push(`Interest added: $${this.#interest.toFixed(2)}`);
  }

  get balance() { return this.#balance; }
  get interest() { return this.#interest; }
  get interestRate() { return this.#interestRate; }
  get transactions() { return this.#transactions; }
  get history() { return [...this.#history]; }

  toJSON() {
    return {
      balance: this.#balance,
      interestRate: this.#interestRate,
      interest: this.#interest,
      transactions: this.#transactions,
      history: this.#history,
    };
  }

  static fromJSON(data) {
    const acc = new Account(data.balance, data.interestRate);
    acc.#interest = data.interest;
    acc.#transactions = data.transactions;
    acc.#history = data.history || [];
    return acc;
  }
}

//User Class
class User {
  constructor(name, account) {
    this.name = name;
    this.account = account;
  }

  toJSON() {
    return {
      name: this.name,
      account: this.account.toJSON()
    };
  }

  static fromJSON(data) {
    return new User(data.name, Account.fromJSON(data.account));
  }
}
//Data management
let users = [];
let currentAccount = null;
let selectedUser = null;

function loadUsers() {
  const stored = localStorage.getItem("bankUsers");
  if (stored) {
    users = JSON.parse(stored).map(User.fromJSON);
  } else {
    users = [
      new User("Alice", new Account(300, 0.04)),
      new User("Bob", new Account(150, 0.03)),
      new User("Charlie", new Account(500, 0.05))
    ];
    saveUsers();
  }
}

function saveUsers() {
  localStorage.setItem("bankUsers", JSON.stringify(users.map(u => u.toJSON())));
}
//UI References
const userSelect = document.getElementById("user-select");
const sections = {
  login: document.getElementById("login-section"),
  register: document.getElementById("register-section"),
  app: document.getElementById("app-section"),
  logout: document.getElementById("logout-section")
};

const fields = {
  name: document.getElementById("account-name"),
  balance: document.getElementById("balance"),
  transactions: document.getElementById("transactions"),
  interest: document.getElementById("interest"),
  log: document.getElementById("log")
};
//UI Logic
function populateUserSelect() {
  userSelect.innerHTML = "";
  users.forEach((user, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = user.name;
    userSelect.appendChild(option);
  });
}

function updateUI() {
  fields.name.textContent = `Account: ${selectedUser.name}`;
  fields.balance.textContent = currentAccount.balance.toFixed(2);
  fields.transactions.textContent = currentAccount.transactions;
  fields.interest.textContent = currentAccount.interest.toFixed(2);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
//Auth Logic
function login() {
  const index = userSelect.value;
  selectedUser = users[index];
  currentAccount = selectedUser.account;

  sections.login.style.display = "none";
  sections.app.style.display = "block";
  sections.logout.style.display = "block";
  sections.register.style.display = "none";

  updateUI();
}

function logout() {
  currentAccount = null;
  sections.login.style.display = "block";
  sections.app.style.display = "none";
  sections.logout.style.display = "none";
  sections.register.style.display = "none";
}

function signup() {
  sections.login.style.display = "none";
  sections.app.style.display = "none";
  sections.register.style.display = "block";
}
//Actions (Bank Ops)
function handleDeposit() {
  const amount = parseFloat(prompt("Deposit amount:"));
  if (amount > 0) {
    currentAccount.deposit(amount);
    flashBalance();
    saveUsers();
    updateUI();
  }
}

function handleWithdraw() {
  const amount = parseFloat(prompt("Withdraw amount:"));
  if (amount > 0) {
    try {
      currentAccount.withdraw(amount);
      flashBalance();
      saveUsers();
      updateUI();
    } catch (err) {
      alert(err.message);
    }
  }
}

function handleInterest() {
  currentAccount.calcInterest();
  flashBalance();
  saveUsers();
  updateUI();
}

function showHistory() {
  fields.log.innerHTML =
    "<strong>Transaction History:</strong><br>" +
    currentAccount.history.map(h => `+ ${h}`).join("<br>");
}
//Register Logic
function register() {
  const name = document.getElementById("new-name").value.trim();
  const balance = parseFloat(document.getElementById("new-balance").value);
  const rate = parseFloat(document.getElementById("new-rate").value);

  if (!name || isNaN(balance) || isNaN(rate)) {
    alert("Please fill all fields correctly.");
    return;
  }

  if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
    alert("A user with that name already exists.");
    return;
  }

  const newUser = new User(name, new Account(balance, rate));
  users.push(newUser);
  saveUsers();

  populateUserSelect();
  userSelect.value = users.length - 1;
  login();

  document.getElementById("new-name").value = "";
  document.getElementById("new-balance").value = "";
  document.getElementById("new-rate").value = "";
}
//Animation
function flashBalance() {
  const bal = document.getElementById("balance");
  bal.classList.add("animate-ping");
  setTimeout(() => bal.classList.remove("animate-ping"), 300);
}


//Initialization
loadUsers();
populateUserSelect();
