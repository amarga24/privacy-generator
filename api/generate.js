// ============================================================
// api/generate.js
// ------------------------------------------------------------
// 概要: プライバシーポリシーHTMLを生成して返却するAPI関数。
// 仕様: POSTで受け取ったJSONデータを policy-template.js に渡し、
//       即時にHTMLを返却（保存・ログ出力は行わない）。
// ============================================================

import { buildPolicyHTML } from "./policy-template.js";

export default async function handler(req, res) {
  try {
    // POSTメソッド以外を拒否
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Method Not Allowed: POSTメソッドのみ使用可能です。");
      return;
    }

    // リクエストボディの読み取り
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    // JSON解析
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
    // 型安全にデータを整形
    // -----------------------------------------
    function sanitizeValue(value) {
      if (Array.isArray(value)) {
        return value.map(v => String(v).trim()).join(", ");
      }
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
      }
      if (typeof value === "string") {
        return value.trim();
      }
      if (value == null || value === undefined) {
        return "";
      }
      return String(value);
    }

    const sanitizedData = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedData[key] = sanitizeValue(value);
    }

    // -----------------------------------------
    // HTML生成
    // -----------------------------------------
    const html = buildPolicyHTML(sanitizedData);

    // -----------------------------------------
    // レスポンス返却
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
