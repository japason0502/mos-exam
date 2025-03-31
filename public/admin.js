document.addEventListener('DOMContentLoaded', () => {
    // ページ読み込み時に問題一覧を表示
    updateQuestionTable();

    // フィルター変更時のイベント
    document.getElementById('filterProject').addEventListener('change', updateQuestionTable);

    // CSVインポート
    document.getElementById('csvImport').addEventListener('change', handleCSVImport);
});

function updateQuestionTable() {
    const projectId = parseInt(document.getElementById('filterProject').value);

    // プロジェクトIDのみでフィルタリング
    const filteredQuestions = questionData.filter(q => q.projectId === projectId);

    // テーブル更新
    const tbody = document.getElementById('questionTableBody');
    tbody.innerHTML = '';

    filteredQuestions.forEach(q => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${q.questionId}</td>
            <td>${q.questionText}</td>
            <td>
                <button onclick="editQuestion(${q.questionId})" class="admin-button">編集</button>
                <button onclick="deleteQuestion(${q.questionId})" class="admin-button secondary">削除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editQuestion(questionId) {
    const question = questionData.find(q => q.questionId === questionId);
    if (question) {
        // プロジェクトIDのみを更新
        document.getElementById('filterProject').value = question.projectId;
        
        // 編集フォームに値をセット
        document.getElementById('editQuestionId').value = questionId;
        document.getElementById('questionTextArea').value = question.questionText;
        
        // テーブルを更新
        updateQuestionTable();
    }
}

function saveQuestion() {
    const questionId = document.getElementById('editQuestionId').value;
    const questionText = document.getElementById('questionTextArea').value;
    const projectId = parseInt(document.getElementById('filterProject').value);

    if (questionId) {
        // 既存の問題を更新
        const question = questionData.find(q => q.questionId === parseInt(questionId));
        if (question) {
            question.questionText = questionText;
            question.projectId = projectId;
        }
    } else {
        // 新規追加
        const newQuestionId = Math.max(...questionData.map(q => q.questionId)) + 1;
        questionData.push({
            appId: 1, // デフォルト値
            examId: 1, // デフォルト値
            projectId,
            questionId: newQuestionId,
            questionText
        });
    }

    // 更新後の処理
    updateQuestionTable();
    clearForm();
    saveToLocalStorage();
}

function clearForm() {
    document.getElementById('editQuestionId').value = '';
    document.getElementById('questionTextArea').value = '';
}

function deleteQuestion(questionId) {
    if (confirm('この問題を削除してもよろしいですか？')) {
        const index = questionData.findIndex(q => q.questionId === questionId);
        if (index !== -1) {
            questionData.splice(index, 1);
            updateQuestionTable();
            saveToLocalStorage();
        }
    }
}

function exportToCSV() {
    const csv = questionData.map(q => 
        `${q.appId},${q.examId},${q.projectId},${q.questionId},"${q.questionText}"`
    ).join('\n');
    // CSVファイルとしてダウンロード
}

function handleCSVImport(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    // CSVファイルを読み込んでデータを更新
}

function saveToLocalStorage() {
    // ブラウザのローカルストレージにデータを保存
    localStorage.setItem('questionData', JSON.stringify(questionData));
}

function switchTab(tabName) {
    // タブの切り替え
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabName + 'Tab').style.display = 'block';

    // ボタンのアクティブ状態を切り替え
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');

    // CSVタブが選択された場合、データを読み込む
    if (tabName === 'csv') {
        loadCSVToEditor();
    }
}

function loadCSVToEditor() {
    const tbody = document.getElementById('csvTableBody');
    tbody.innerHTML = '';

    questionData.forEach(q => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${q.questionId}</td>
            <td>
                <select class="csv-select" onchange="updateQuestionData(${q.questionId}, 'appId', this.value)">
                    <option value="1" ${q.appId === 1 ? 'selected' : ''}>Excel</option>
                    <option value="2" ${q.appId === 2 ? 'selected' : ''}>Word</option>
                    <option value="3" ${q.appId === 3 ? 'selected' : ''}>PowerPoint</option>
                </select>
            </td>
            <td>
                <select class="csv-select" onchange="updateQuestionData(${q.questionId}, 'examId', this.value)">
                    <option value="1" ${q.examId === 1 ? 'selected' : ''}>模擬試験1</option>
                    <option value="2" ${q.examId === 2 ? 'selected' : ''}>模擬試験2</option>
                </select>
            </td>
            <td>
                <select class="csv-select" onchange="updateQuestionData(${q.questionId}, 'projectId', this.value)">
                    <option value="1" ${q.projectId === 1 ? 'selected' : ''}>Project 1</option>
                    <option value="2" ${q.projectId === 2 ? 'selected' : ''}>Project 2</option>
                    <option value="3" ${q.projectId === 3 ? 'selected' : ''}>Project 3</option>
                    <option value="4" ${q.projectId === 4 ? 'selected' : ''}>Project 4</option>
                    <option value="5" ${q.projectId === 5 ? 'selected' : ''}>Project 5</option>
                </select>
            </td>
            <td>
                <textarea class="csv-textarea" onchange="updateQuestionData(${q.questionId}, 'questionText', this.value)">${q.questionText}</textarea>
            </td>
            <td>
                <button onclick="deleteQuestion(${q.questionId})" class="admin-button secondary">削除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateQuestionData(questionId, field, value) {
    const question = questionData.find(q => q.questionId === questionId);
    if (question) {
        question[field] = field === 'questionText' ? value : parseInt(value);
        saveToLocalStorage();
    }
}

function saveCSVFromEditor() {
    try {
        saveToLocalStorage();
        alert('保存しました。index.htmlを開き直すと反映されます。');
    } catch (error) {
        alert('保存中にエラーが発生しました');
        console.error(error);
    }
} 