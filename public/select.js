document.addEventListener('DOMContentLoaded', () => {
    const appSelect = document.getElementById('appSelect');
    const examSelectSection = document.getElementById('examSelectSection');
    const examSelect = document.getElementById('examSelect');
    const nextButton = document.getElementById('nextButton');
    const startButton = document.getElementById('startButton');
    const noTimer = document.getElementById('noTimer');

    // アプリケーション選択時
    nextButton.addEventListener('click', () => {
        examSelectSection.style.display = 'block';
        nextButton.style.display = 'none';
        startButton.style.display = 'block';
    });

    // 開始ボタンクリック時
    startButton.addEventListener('click', () => {
        // 選択された値をローカルストレージに保存
        localStorage.setItem('selectedApp', appSelect.value);
        localStorage.setItem('selectedExam', examSelect.value);
        localStorage.setItem('noTimer', noTimer.checked);
        
        // メイン画面へ遷移
        window.location.href = 'select.html';
    });
}); 