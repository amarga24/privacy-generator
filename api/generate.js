// ================================================
// generate.js：プライバシーポリシーHTML生成用サーバーレス関数
// 役割：フォーム入力データ(JSON)を受け取り、テンプレート統合関数を呼び出してHTMLを生成。
// 注意：入力データは保存・ログ出力しない。即時レスポンスのみ。
// ================================================

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

    // リクエストボディを手動で読み取り（Node環境対応）
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    const data = JSON.parse(body);

    // HTML生成
    const html = buildPolicyHTML(data);

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
