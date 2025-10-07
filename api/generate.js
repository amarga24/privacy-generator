// ============================================================
// api/generate.js
// ------------------------------------------------------------
// 概要: プライバシーポリシーHTMLを生成して返却するAPI関数。
// 仕様: POSTで受け取ったJSONデータを policy-template.js に渡し、
//       即時にHTMLを返却（保存・ログ出力は行わない）。
// 環境: Node.js (ESM), Vercel サーバーレス関数対応。
// ============================================================

import { buildPolicyHTML } from "./policy-template.js";

// ------------------------------------------------------------
// メインハンドラ（Vercel サーバーレス関数）
// ------------------------------------------------------------
export default async function handler(req, res) {
  try {
    // -----------------------------------------
    // 1. HTTPメソッドの確認（POST以外は拒否）
    // -----------------------------------------
    if (req.method !== "POST") {
      res.statusCode = 405; // Method Not Allowed
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Method Not Allowed: POSTメソッドのみ使用可能です。");
      return;
    }

    // -----------------------------------------
    // 2. リクエストボディの読み取り
    // -----------------------------------------
    // Node.jsのサーバーレス環境では req.body が自動パースされない場合があるため、
    // 手動で文字列を受け取り、JSON.parse() で解析。
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    // JSON形式を解析（パースエラー時は400 Bad Request）
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      res.statusCode = 400;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Bad Request: JSON形式が不正です。");
      return;
    }

    // -----------------------------------------
    // 3. HTML生成処理
    // -----------------------------------------
    // policy-template.js の buildPolicyHTML() を呼び出し。
    // → JSONデータに基づき、各セクションを構築。
    const html = buildPolicyHTML(data);

    // -----------------------------------------
    // 4. レスポンス返却
    // -----------------------------------------
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);

  } catch (error) {
    // -----------------------------------------
    // 5. 予期せぬエラー時の処理
    // -----------------------------------------
    console.error("Error in generate.js:", error);

    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Internal Server Error: HTML生成中に問題が発生しました。");
  }
}
