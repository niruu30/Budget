import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWSpV2Aw-NJq9EoCEymChf6xDQrFCW19M",
  authDomain: "moneytracker-e9e07.firebaseapp.com",
  projectId: "moneytracker-e9e07",
  storageBucket: "moneytracker-e9e07.firebasestorage.app",
  messagingSenderId: "627795437030",
  appId: "1:627795437030:web:cb9508b0b58b513daa6227",
  measurementId: "G-0WK5XJZ663"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to read current balances from Firebase
function readBalances() {
  const dbRef = ref(db, 'AccountBalance/');
  return get(dbRef);
}

// Function to update the balances in Firebase
function updateBalancesInFirebase(amount) {
  const dbRef = ref(db, 'AccountBalance');

  const selectedBank = document.getElementById("bank");
  const selectedCategory = document.getElementById("category").value;
  let isIncome = selectedCategory === "income" ? true : false;

  // Fetch current data from AccountBalance
  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {

      let currentData = snapshot.val();
      console.log(currentData);

      const bankMap = {
        "bdo": "BDO",
        "bpi": "BPI",
        "gotyme": "GoTyme"
      };

      const bankName = bankMap[selectedBank.value];
      if (bankName) {
        currentData[bankName] += isIncome ? amount : -amount;
        console.log(`${bankName}: ${currentData[bankName]}`);
      }

      currentData.TotalBalance = currentData.BDO + currentData.BPI + currentData.GoTyme;
      console.log("Total Balance: " + currentData.TotalBalance);

      update(dbRef, currentData)
        .then(() => {
          readBalances().then((snapshot) => {
            if (snapshot.exists()) {
              updateBalancesUI(snapshot.val());
            }
          });
          console.log("Account Balance successfully updated!");
          $('#modal-container').addClass('out');
          toggleButton();
        })
        .catch((error) => {
          console.error("Error updating AccountBalance:", error);
        });
    } else {
      console.log("No AccountBalance data available in Firebase.");
    }
  }).catch((error) => {
    console.error("Error reading data from Firebase:", error);
  });
}

// Function to add a transaction
window.addTransaction = function () {
  let amount = parseFloat(document.getElementById('amount').value);

  if (isNaN(amount) || amount === 0) {
    alert('Please enter a valid amount');
    return;
  }

  const button = document.getElementsByClassName("loading-button")[0];

  button.classList.add("loading");
  setTimeout(function () {
    button.classList.remove("loading");
    button.classList.add("success");

    setTimeout(function () {
      updateBalancesInFirebase(amount);
      button.classList.remove("success");
    }, 2000);
  }, 3000);
};

// Function to update the UI with the latest balances
function updateBalancesUI(balances) {
  document.getElementById('bpi-balance').textContent = balances.BPI.toFixed(2);
  document.getElementById('bdo-balance').textContent = balances.BDO.toFixed(2);
  document.getElementById('gotyme-balance').textContent = balances.GoTyme.toFixed(2);

  const totalBalance = balances.BDO + balances.BPI + balances.GoTyme;
  document.getElementById('total-balance').textContent = 'PHP ' + totalBalance.toFixed(2);

  var valBDO = balances.BDO;
  var valBPI = balances.BPI;
  var valGoTyme = balances.GoTyme;

  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        'BDO',
        'BPI',
        'GoTyme'
      ],
      datasets: [{
        label: 'Balance',
        data: [valBDO, valBPI, valGoTyme],
        backgroundColor: [
          '#1c63cc',
          '#ef4648',
          '#3eaca8'
        ],
        hoverOffset: 4
      }]
    },
  });
}

readBalances().then((snapshot) => {
  if (snapshot.exists()) {
    updateBalancesUI(snapshot.val());
  }
});