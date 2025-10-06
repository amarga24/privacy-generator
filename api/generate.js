/**
 * generate.js
 * --------------------------------------------------
 * このスクリプトは、既存のHTML（index.html）を読み込み、
 * タイトル・ボタン・フッターを追加して新しいHTMLを出力します。
 * 実行コマンド: node generate.js
 * --------------------------------------------------
 */

const fs = require("fs");
const cheerio = require("cheerio");

const INPUT = "./index.html";
const OUTPUT_DIR = "./output";
const OUTPUT = `${OUTPUT_DIR}/index.html`;

// ページに挿入する文字
const pageTitle = "プライバシー生成ツール";
const footerText = "© 2025 AMARGA. All rights reserved.";
const buttonLabel = "保存する";
const alertMessage = "データを保存しました！";

// ------------------------------
// 1. 元HTMLの存在チェック
// ------------------------------
if (!fs.existsSync(INPUT)) {
  console.error(`エラー: ${INPUT} が見つかりません。`);
  process.exit(1);
}

// ------------------------------
// 2. 既存の出力フォルダを削除（あれば）
// ------------------------------
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  console.log("既存の output フォルダを削除しました。");
}

// ------------------------------
// 3. HTMLファイルを読み込み
// ------------------------------
const html = fs.readFileSync(INPUT, "utf-8");
const $ = cheerio.load(html);
console.log("HTMLを読み込みました。");

// ------------------------------
// 4. HTMLを加工
// ------------------------------
$("body").prepend(`<h1>${pageTitle}</h1>`);
$("body").append(`<footer>${footerText}</footer>`);
$("body").append(`
  <button id="clickButton">${buttonLabel}</button>
  <script>
    document.getElementById('clickButton')?.addEventListener('click', () => {
      alert('${alertMessage}');
    });
  </script>
`);

// 生成日時をページ下部に追記
const now = new Date().toLocaleString("ja-JP");
$("body").append(`<p>生成日時: ${now}</p>`);
console.log("HTML要素を追加しました。");

// ------------------------------
// 5. フォルダを再作成して出力
// ------------------------------
fs.mkdirSync(OUTPUT_DIR);
fs.writeFileSync(OUTPUT, $.html(), "utf-8");
console.log("新しいHTMLを output フォルダに書き出しました。");

// ------------------------------
// 6. 完了メッセージ
// ------------------------------
console.log("✅ Node.jsの動作テスト完了。ブラウザで output/index.html を確認してください。");
