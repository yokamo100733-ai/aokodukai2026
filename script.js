// 画面要素の取得
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');

// 1. ログイン処理
function login() {
    const pass = document.getElementById('password').value;
    if (pass === '1234') {
        loginScreen.style.display = 'none';
        mainScreen.style.display = 'block';
    } else {
        alert('パスワードが違います');
    }
}

// データを保持する配列（LocalStorageから読み込む）
let ledgerData = JSON.parse(localStorage.getItem('myLedger')) || [];

window.onload = () => {
    // 初期表示の月を今月に設定
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    document.getElementById('filter-month').value = currentMonth;
    document.getElementById('item-date').valueAsDate = new Date();

    renderTable();
};

function saveToStorage() {
    localStorage.setItem('myLedger', JSON.stringify(ledgerData));
}

function addEntry() {
    const date = document.getElementById('item-date').value;
    const name = document.getElementById('item-name').value;
    const amount = Number(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;

    if (!date || !name || !amount) return alert('全て入力してください');

    const newEntry = { id: Date.now(), date, name, amount, type, category };
    ledgerData.push(newEntry);

    saveToStorage();
    renderTable();

    // 入力欄クリア（日付は残したほうが連続入力しやすいのでそのまま）
    document.getElementById('item-name').value = '';
    document.getElementById('amount').value = '';
}

// テーブルの描画
function renderTable() {
    const tbody = document.getElementById('ledger-body');
    const filterMonth = document.getElementById('filter-month').value;
    
    if (!tbody || !filterMonth) return; // 要素がない場合は何もしない


    tbody.innerHTML = ''; 

    // 1. 選択された月のデータだけに絞り込み、日付順にソート
    const filteredData = ledgerData
        .filter(item => {
            // item.date が空だったり undefined だったりする場合を除外する
            return item && item.date && typeof item.date === 'string' && item.date.startsWith(filterMonth);
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. 絞り込んだデータをループで表示
    filteredData.forEach((item) => {
        const row = tbody.insertRow();
        
        // セルを0番から順番に確実に作成（HTMLの見出し6つに対応）
        const cellDate     = row.insertCell(0); // 日付
        const cellName     = row.insertCell(1); // 項目
        const cellCategory = row.insertCell(2); // カテゴリ
        const cellIncome   = row.insertCell(3); // 収入
        const cellExpense  = row.insertCell(4); // 支出
        const cellAction   = row.insertCell(5); // 操作（削除ボタン）

        // 各セルにデータを流し込む
        cellDate.textContent     = item.date;
        cellName.textContent     = item.name;
        cellCategory.textContent = item.category;
        
        if (item.type === 'income') {
            cellIncome.textContent = `¥${item.amount.toLocaleString()}`;
            cellIncome.style.color = 'blue'; // 収入を青文字に
            cellExpense.textContent = '-';
        } else {
            cellIncome.textContent = '-';
            cellExpense.textContent = `¥${item.amount.toLocaleString()}`;
            cellExpense.style.color = 'red'; // 支出を赤文字に
        }

        // 削除ボタン
        cellAction.innerHTML = `<button onclick="deleteEntry(${item.id})">削除</button>`;
    });

    // 3. 合計金額の更新
    updateSummary(filteredData);
}

function updateSummary(data) {
    const totalIncome = data
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = data
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

    document.getElementById('total-income').textContent = `¥${totalIncome.toLocaleString()}`;
    document.getElementById('total-expense').textContent = `¥${totalExpense.toLocaleString()}`;
    document.getElementById('total-balance').textContent = `¥${(totalIncome - totalExpense).toLocaleString()}`;
}

function deleteEntry(id) {
    if(!confirm('本当に削除しますか？')) return;
    ledgerData = ledgerData.filter(item => item.id !== id);
    saveToStorage();
    renderTable();
}

function logout() {
    mainScreen.style.display = 'none';
    loginScreen.style.display = 'block';
    document.getElementById('password').value = '';
}