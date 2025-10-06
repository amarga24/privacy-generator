// =======================================================
// policy-template.js：テンプレート統合モジュール
// 役割：セクション構成ルールに従い、各テンプレートを読み込み統合してHTMLを生成。
// =======================================================

// api/policy-template.js
// 各セクションテンプレートを統合してHTMLを生成するモジュール

// フル相対パスで指定（Node ESMでは重要）
import { SECTION_RULES } from "./config/sections.js";

// Nodeのファイルシステム等は不要（サーバーレス内で完結）
export async function buildPolicyHTML(data) {
  let html = `<h1>${data.base.siteName} プライバシーポリシー</h1>`;

  for (const rule of SECTION_RULES) {
    if (rule.condition && !rule.condition(data)) continue;

    const modulePath = `./templates/${rule.file}`;
    const sectionModule = await import(modulePath);
    html += await sectionModule.default(data);
  }

  return `
  <!DOCTYPE html>
  <html lang="ja">
  <head><meta charset="utf-8"><title>${data.base.siteName} | プライバシーポリシー</title></head>
  <body>${html}</body>
  </html>`;
}
