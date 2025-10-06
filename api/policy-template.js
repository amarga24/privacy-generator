// =======================================================
// policy-template.js：テンプレート統合モジュール
// 役割：セクション構成ルールに従い、各テンプレートを読み込み統合してHTMLを生成。
// =======================================================

import { SECTION_RULES } from './config/sections.js';

// HTML組み立て関数（メイン処理）
export async function buildPolicyHTML(data) {
  let body = '';

  // SECTION_RULESの順序に沿ってテンプレートを読み込む
  for (const rule of SECTION_RULES) {
    // 条件付きセクションは condition が true のときのみ追加
    if (rule.condition && !rule.condition(data)) continue;

    // テンプレートモジュールを動的に読み込む
    const mod = await import(`./templates/${rule.file}`);

    // デフォルトエクスポートが関数であれば呼び出し
    if (typeof mod.default === 'function') {
      body += mod.default(data);
    }
  }

  // 完成したHTML全体を返す
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>プライバシーポリシー</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; line-height: 1.8; padding: 40px; color: #222; max-width: 900px; margin: auto; }
    h2 { border-bottom: 2px solid #ddd; padding-bottom: 4px; margin-top: 32px; }
    h1 { font-size: 1.8em; margin-bottom: 0.5em; }
    section { margin-bottom: 2em; }
  </style>
</head>
<body>
  <h1>${data.base?.siteName || 'プライバシーポリシー'}</h1>
  ${body}
</body>
</html>
  `;
}
