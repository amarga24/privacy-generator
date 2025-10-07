// ============================================================
// api/generate.js
// ------------------------------------------------------------
// 概要: プライバシーポリシーHTMLを生成して返却するAPI関数。
// ============================================================

import { buildPolicyHTML } from "./policy-template.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Method Not Allowed: POSTメソッドのみ使用可能です。");
      return;
    }

    let body = "";
    for await (const chunk of req) body += chunk;

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
    // 再帰的にデータをクリーン化
    // -----------------------------------------
    function sanitizeValue(value) {
      if (Array.isArray(value)) {
        return value.map(v => sanitizeValue(v));
      }
      if (typeof value === "object" && value !== null) {
        const cleaned = {};
        for (const [k, v] of Object.entries(value)) {
          cleaned[k] = sanitizeValue(v);
        }
        return cleaned;
      }
      if (typeof value === "string") return value.trim();
      if (value == null || value === undefined) return "";
      return String(value);
    }

    const sanitizedData = sanitizeValue(data);

    // -----------------------------------------
    // HTML生成
    // -----------------------------------------
    const html = buildPolicyHTML(sanitizedData);

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
