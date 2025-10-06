// ================================================
// generate.js：プライバシーポリシーHTML生成用サーバーレス関数
// 役割：フォーム入力データ(JSON)を受け取り、テンプレート統合関数を呼び出してHTMLを生成。
// 注意：入力データは保存・ログ出力しない。即時レスポンスのみ。
// ================================================

// api/generate.js
// api/generate.js
import { buildPolicyHTML } from './policy-template.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Method Not Allowed');
      return;
    }

    // リクエストボディを読み取る
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    const data = JSON.parse(body);

    // ✅ buildPolicyHTML が Promise を返す可能性に対応
    const html = await buildPolicyHTML(data);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  } catch (error) {
    console.error('❌ Error in generate.js:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
}

