// ================================================
// generate.js：プライバシーポリシーHTML生成用サーバーレス関数
// 役割：フォーム入力データ(JSON)を受け取り、テンプレート統合関数を呼び出してHTMLを生成。
// 注意：入力データは保存・ログ出力しない。即時レスポンスのみ。
// ================================================

import { buildPolicyHTML } from './policy-template.js';

export default async function handler(req, res) {
  try {
    // POST以外のリクエストは拒否
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // クライアントから送信されたJSONデータを取得
    const data = req.body;

    // テンプレート結合処理を実行（policy-template.js でHTML生成）
    const html = await buildPolicyHTML(data);

    // 成功時はHTML文字列を返す
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);

  } catch (err) {
    // エラーハンドリング
    console.error('Error generating policy:', err);
    res.status(500).send('Internal Server Error');
  }
}
