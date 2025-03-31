// グローバル変数
let currentProject = 1;
let currentQuestion = 1;
let selectedApp;
let selectedExam;

// タイマー関連の変数
let timeLeft;
let timerInterval;

// 問題データはquestions.jsから読み込む
loadQuestionData();

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    // 選択された値を取得
    selectedApp = parseInt(localStorage.getItem('selectedApp')) || 1;
    selectedExam = parseInt(localStorage.getItem('selectedExam')) || 1;

    // 問題表示画面の場合のみ初期化
    if (document.getElementById('questionText')) {
        restoreState();
        initializeTimer();
        initializeQuestionNav();
        updateQuestionDisplay();
    }
    
    // レビューページの場合
    if (window.location.pathname.endsWith('review.html')) {
        initializeReviewPage();
    }
});

// 状態の保存と復元
function saveState() {
    const state = {
        currentProject,
        currentQuestion,
        questions: {}
    };
    
    // 各問題の状態を保存
    for (let p = 1; p <= 6; p++) {
        state.questions[`project${p}`] = [];
        for (let q = 1; q <= 7; q++) {
            state.questions[`project${p}`].push({
                id: q,
                needsReview: localStorage.getItem(`review_p${p}_q${q}`) === 'true',
                isCompleted: localStorage.getItem(`completed_p${p}_q${q}`) === 'true'
            });
        }
    }
    
    localStorage.setItem('mosExamState', JSON.stringify(state));
}

function restoreState() {
    const savedState = localStorage.getItem('mosExamState');
    if (savedState) {
        const state = JSON.parse(savedState);
        currentProject = state.currentProject;
        currentQuestion = state.currentQuestion;
        
        // UI更新
        updateUIState();
    }
}

function updateQuestionStatus() {
    const needsReview = localStorage.getItem(`review_p${currentProject}_q${currentQuestion}`) === 'true';
    const isCompleted = localStorage.getItem(`completed_p${currentProject}_q${currentQuestion}`) === 'true';
    
    const statusHtml = `
        <div class="question-status">
            <button class="status-btn review-btn ${needsReview ? 'active' : ''}" 
                    onclick="toggleReviewStatus(${currentProject}, ${currentQuestion})">
                あとで見直す <span class="check-mark">${needsReview ? '✓' : ' '}</span>
            </button>
            <button class="status-btn answered-btn ${isCompleted ? 'active' : ''}" 
                    onclick="toggleAnsweredStatus(${currentProject}, ${currentQuestion})">
                回答済み <span class="check-mark">${isCompleted ? '✓' : ' '}</span>
            </button>
        </div>
    `;
    
    const statusElement = document.getElementById('questionStatus');
    if (statusElement) {
        statusElement.innerHTML = statusHtml;
    }
}

function moveToPreviousProject() {
    const maxProjects = getAvailableProjects();
    if (currentProject > 1) {
        currentProject--;
    } else {
        currentProject = maxProjects; // 最後のプロジェクトに戻る
    }
    currentQuestion = 1;
    updateUIState();
    saveState();
}

function moveToNextProject() {
    const maxProjects = getAvailableProjects();
    
    if (currentProject < maxProjects) {
        // 通常の次のプロジェクトへの移動
        currentProject++;
        currentQuestion = 1;
        updateUIState();
        saveState();
    } else {
        // 最後のプロジェクトの場合はレビューページへ
        window.location.href = 'review.html';
    }
}

function updateUIState() {
    const projectNumberElement = document.getElementById('projectNumber');
    if (projectNumberElement) {
        const maxProjects = getAvailableProjects();
        projectNumberElement.textContent = `プロジェクト ${currentProject}/${maxProjects}`;
        updateQuestionDisplay();
        updateQuestionStatus();
        updateQuestionButtons();
    }
}

function updateQuestionButtons() {
    // 問題ボタンの状態を更新
    const questionButtons = document.querySelectorAll('.question-btn');
    questionButtons.forEach((button, index) => {
        // 現在の問題のボタンをアクティブに
        button.classList.toggle('active', index + 1 === currentQuestion);
        
        // 完了済みの問題にはクラスを追加
        const isCompleted = localStorage.getItem(`completed_p${currentProject}_q${index + 1}`) === 'true';
        button.classList.toggle('completed', isCompleted);
        
        // レビュー対象の問題にはクラスを追加
        const needsReview = localStorage.getItem(`review_p${currentProject}_q${index + 1}`) === 'true';
        button.classList.toggle('needs-review', needsReview);
    });
}

function restoreCheckboxStates() {
    const needsReview = localStorage.getItem(`review_p${currentProject}_q${currentQuestion}`) === 'true';
    const isCompleted = localStorage.getItem(`completed_p${currentProject}_q${currentQuestion}`) === 'true';
    
    if (document.getElementById('needsReview')) {
        document.getElementById('needsReview').checked = needsReview;
        document.getElementById('isCompleted').checked = isCompleted;
    }
}

function initializeTimer() {
    const noTimer = localStorage.getItem('noTimer') === 'true';
    const timerElement = document.getElementById('timer');
    
    if (noTimer) {
        // タイマーなしの場合
        if (timerElement) {
            timerElement.style.display = 'none';
        }
        return;
    }

    // 以下、既存のタイマー処理
    timeLeft = parseInt(localStorage.getItem('timeLeft')) || 3000;
    updateTimerDisplay();
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timeLeft--;
        localStorage.setItem('timeLeft', timeLeft);
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('時間切れです');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `残り時間: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function initializeQuestionNav() {
    const questionNav = document.querySelector('.question-nav');
    if (!questionNav) return;

    questionNav.innerHTML = ''; // 既存のボタンをクリア
    
    // 現在のプロジェクトの問題数を取得
    const questionCount = getQuestionsPerProject(currentProject);
    
    // 問題数分のボタンを生成
    for (let i = 1; i <= questionCount; i++) {
        const button = document.createElement('button');
        button.className = 'question-btn';
        button.textContent = i;
        button.addEventListener('click', () => {
            currentQuestion = i;
            updateUIState();
            saveState();
        });
        questionNav.appendChild(button);
    }
    
    updateQuestionButtons();
}

function initializeReviewPage() {
    const tableBody = document.getElementById('reviewTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const maxProjects = getAvailableProjects();
    
    for (let p = 1; p <= maxProjects; p++) {
        // プロジェクトヘッダー
        const projectRow = document.createElement('tr');
        projectRow.innerHTML = `
            <td colspan="3" class="project-header">
                プロジェクト ${p}
            </td>
        `;
        tableBody.appendChild(projectRow);
        
        // プロジェクトごとの問題数を取得
        const questionCount = getQuestionsPerProject(p);
        
        // 問題を表示
        for (let q = 1; q <= questionCount; q++) {
            const needsReview = localStorage.getItem(`review_p${p}_q${q}`) === 'true';
            const isCompleted = localStorage.getItem(`completed_p${p}_q${q}`) === 'true';
            
            const row = document.createElement('tr');
            row.className = q === questionCount ? 'project-separator' : '';
            
            row.innerHTML = `
                <td class="question-cell">
                    <a href="#" class="question-link" onclick="goToQuestion(${p}, ${q})">
                        問題 ${q}
                    </a>
                </td>
                <td class="status-cell">
                    ${needsReview ? '<span class="status-label review">要レビュー</span>' : ''}
                </td>
                <td class="status-cell">
                    ${isCompleted ? '<span class="status-label completed">回答済み</span>' : ''}
                </td>
            `;
            
            tableBody.appendChild(row);
        }
    }

    // タイマー表示を更新
    const noTimer = localStorage.getItem('noTimer') === 'true';
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        if (noTimer) {
            timerElement.style.display = 'none';
        } else {
            timeLeft = parseInt(localStorage.getItem('timeLeft')) || 3000;
            updateTimerDisplay();
        }
    }
}

function goToQuestion(project, question) {
    currentProject = project;
    currentQuestion = question;
    saveState();
    window.location.href = 'select.html';
}

function updateReviewStatus(project, question, status) {
    localStorage.setItem(`review_p${project}_q${question}`, status);
    saveState();
}

function updateCompletedStatus(project, question, status) {
    localStorage.setItem(`completed_p${project}_q${question}`, status);
    saveState();
}

function updateQuestionDisplay() {
    const currentQuestionData = questionData.find(q => 
        q.appId === selectedApp &&
        q.examId === selectedExam &&
        q.projectId === currentProject &&
        q.questionId === currentQuestion
    );

    const questionText = document.getElementById('questionText');
    if (currentQuestionData) {
        questionText.textContent = currentQuestionData.questionText;
    } else {
        questionText.textContent = '問題が見つかりません';
    }
}

// 問題データを読み込む関数
function loadQuestions() {
    // questions.jsで定義した関数を使用
    const questions = loadQuestionData();
    // 以降の処理は既存のコードを使用
    // ...
}

// ステータス切り替え関数を修正
function toggleReviewStatus(project, question) {
    const currentStatus = localStorage.getItem(`review_p${project}_q${question}`) === 'true';
    localStorage.setItem(`review_p${project}_q${question}`, !currentStatus);
    updateQuestionStatus();
    updateQuestionButtons();
}

function toggleAnsweredStatus(project, question) {
    const currentStatus = localStorage.getItem(`completed_p${project}_q${question}`) === 'true';
    localStorage.setItem(`completed_p${project}_q${question}`, !currentStatus);
    updateQuestionStatus();
    updateQuestionButtons();
}

// ページを閉じる時の処理
window.addEventListener('beforeunload', () => {
    // タイマーが動いている場合は現在の時間を保存
    if (timeLeft > 0) {
        localStorage.setItem('timeLeft', timeLeft);
    }
});

function finishExam() {
    if (confirm('試験を終了しますか？\n\n※ 終了後は問題の回答状況は保持されます。')) {
        // タイマーを停止
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // 試験終了ボタンを非表示にし、最初の画面に戻るボタンを表示
        const finishArea = document.querySelector('.finish-area');
        if (finishArea) {
            finishArea.innerHTML = `
                <button onclick="window.location.href='index.html'" class="finish-button">
                    最初の画面に戻る
                </button>
            `;
        }
    }
} 