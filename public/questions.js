// 問題データの配列（初期データ）
const initialQuestionData = [
    {appId: 1, examId: 1, projectId: 1, questionId: 1, questionText: "あなたは工場の測定値で生産台数を記録しています。"},
    {appId: 1, examId: 1, projectId: 1, questionId: 2, questionText: "グラフのタイトルを「生産台数推移」に設定してください。"},
    {appId: 1, examId: 1, projectId: 1, questionId: 3, questionText: "Y軸のラベルを「台数」に設定してください。"},
    {appId: 1, examId: 1, projectId: 1, questionId: 4, questionText: "データラベルを追加してください。"},
    {appId: 1, examId: 1, projectId: 1, questionId: 5, questionText: "グラフの色を変更してください。"},
    {appId: 1, examId: 1, projectId: 2, questionId: 1, questionText: "売上データの表を作成してください。"},
    {appId: 1, examId: 1, projectId: 2, questionId: 2, questionText: "合計を計算する数式を入力してください。"}
];

// グローバルな問題データ配列
let questionData = JSON.parse(localStorage.getItem('questionData')) || initialQuestionData;

// LocalStorageからデータを読み込む関数
function loadQuestionData() {
    const storedData = localStorage.getItem('questionData');
    if (storedData) {
        questionData = JSON.parse(storedData);
    }
    return questionData;
}

// データを保存する関数
function saveQuestionData(data) {
    questionData = data;
    localStorage.setItem('questionData', JSON.stringify(data));
}

// 利用可能なプロジェクト数を取得する関数
function getAvailableProjects() {
    const projects = new Set(questionData.map(q => q.projectId));
    return Math.max(...projects);
}

// 各プロジェクトの問題数を取得する関数
function getQuestionsPerProject(projectId) {
    return questionData.filter(q => q.projectId === projectId).length;
} 