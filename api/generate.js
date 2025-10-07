// ============================================================
// api/generate.js
// ------------------------------------------------------------
// 概要: プライバシーポリシーHTMLを生成して返却するAPI関数。
// 仕様: POSTで受け取ったJSONデータを policy-template.js に渡し、
//       即時にHTMLを返却（保存・ログ出力は行わない）。
// ============================================================

import { buildPolicyHTML } from "./policy-template.js";

// ------------------------------------------------------------
// メインハンドラ（Vercel サーバーレス関数）
// ------------------------------------------------------------
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Method Not Allowed: POSTメソッドのみ使用可能です。");
      return;
    }

    // -----------------------------------------
    // 1. リクエストボディの読み取り
    // -----------------------------------------
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

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
    // 2. 型安全処理（非文字列を文字列化）
    // -----------------------------------------
    const sanitizedData = {};
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        sanitizedData[key] = value.map(v => String(v).trim()).join(", ");
      } else if (typeof value === "object" && value !== null) {
        sanitizedData[key] = JSON.stringify(value);
      } else if (typeof value === "string") {
        sanitizedData[key] = value.trim();
      } else if (value == null || value === undefined) {
        sanitizedData[key] = "";
      } else {
        sanitizedData[key] = String(value);
      }
    }

    // -----------------------------------------
    // 3. HTML生成処理
    // -----------------------------------------
    const html = buildPolicyHTML(sanitizedData);

    // -----------------------------------------
    // 4. レスポンス返却
    // -----------------------------------------
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);

  } catch (error) {
    console.error("Error in generate.js:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Internal Server Error: HTML生成中に問題が発生しました。");
  }
}
