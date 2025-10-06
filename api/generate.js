// ================================================
// generate.js：プライバシーポリシーHTML生成用サーバーレス関数
// 役割：フォーム入力データ(JSON)を受け取り、テンプレート統合関数を呼び出してHTMLを生成。
// 注意：入力データは保存・ログ出力しない。即時レスポンスのみ。
// ================================================

// api/generate.js
import { buildPolicyHTML } from './policy-template.js';

// サーバーレス関数のエクスポート（ESM形式）
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const data = await req.json ? await req.json() : await new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => resolve(JSON.parse(body)));
    });

    const html = buildPolicyHTML(data);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    console.error('Error in generate.js:', err);
    res.status(500).send('Internal Server Error');
  }
}

