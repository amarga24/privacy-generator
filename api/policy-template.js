// ============================================================
// api/policy-template.js
// ------------------------------------------------------------
// 概要: プライバシーポリシーHTML本文を生成するモジュール。
// 仕様: api/config/sections.js の順序に基づきセクションを構築。
// 注意: 入力データは保存せず、レスポンス生成後に破棄。
// ============================================================


// ------------------------------------------------------------
// 個人情報の取得方法セクション
// ------------------------------------------------------------
// 【目的】
// ユーザーからの入力や自動取得情報（Cookie等）を説明する。
// 【入力】data.collection
// 【出力】<section>要素（取得方法の説明）
// ------------------------------------------------------------
function sectionCollection(data) {
  const { methods = [], autoCollection = [], detail = "" } = data.collection || {};
  return `
  <section>
    <h2>個人情報の取得方法</h2>
    <p>当サイトでは、${methods.join("、") || "お問い合わせフォームなど"} を通じて利用者から個人情報を取得する場合があります。</p>
    <p>また、自動的に取得される情報として、${autoCollection.join("、") || "アクセスログやCookie情報"} を取得します。</p>
    ${detail ? `<p>${detail}</p>` : ""}
  </section>`;
}


// ------------------------------------------------------------
// 個人情報の利用目的セクション
// ------------------------------------------------------------
// 【目的】
// 取得した個人情報をどのような目的で利用するかを説明する。
// 【入力】data.purposes[] 配列（カテゴリ、対象、説明）
// 【出力】<section>要素（利用目的のリスト）
// ------------------------------------------------------------
function sectionPurposes(data) {
  const purposes = data.purposes || [];
  if (!purposes.length) return "";

  const list = purposes
    .map(
      p => `<li>${p.category || ""}（対象：${p.target || "該当者"}） … ${p.description || ""}</li>`
    )
    .join("");

  return `
  <section>
    <h2>個人情報の利用目的</h2>
    <p>取得した個人情報は、以下の目的のために利用します。</p>
    <ul>${list}</ul>
  </section>`;
}


// ------------------------------------------------------------
// 第三者提供および外部委託セクション
// ------------------------------------------------------------
// 【目的】
// 個人情報を第三者に提供または外部に委託する場合の取扱いを説明。
// 【入力】data.thirdParties（hasProvision, entrustsProcessing 等）
// 【出力】<section>要素（提供・委託の有無と方針）
// ------------------------------------------------------------
function sectionThirdParties(data) {
  const tp = data.thirdParties || {};
  return `
  <section>
    <h2>個人情報の第三者提供および委託</h2>
    ${
      tp.hasProvision
        ? `<p>当サイトでは、${tp.detail || "必要な範囲で第三者提供を行う場合があります。"}。</p>`
        : `<p>当サイトでは、法令に基づく場合を除き、第三者への個人情報の提供は行いません。</p>`
    }
    ${
      tp.entrustsProcessing
        ? `<p>業務委託にあたっては、${(tp.entrustExamples || []).join("、") || "委託先企業"} に適切な管理を求めています。</p>`
        : ""
    }
  </section>`;
}


// ------------------------------------------------------------
// アクセス解析ツールセクション
// ------------------------------------------------------------
// 【目的】
// Google Analytics などの解析ツールの利用状況を説明。
// 【入力】data.analytics（useAnalytics, tools[]）
// 【出力】<section>要素（ツール名・提供者・目的・オプトアウトURL）
// ------------------------------------------------------------
function sectionAnalytics(data) {
  const analytics = data.analytics || {};
  if (!analytics.useAnalytics) return "";

  const tools = (analytics.tools || [])
    .map(
      t => `<li>${t.name}（提供者：${t.provider}） … ${t.purpose || ""}${
        t.optoutUrl ? `（<a href="${t.optoutUrl}" target="_blank">オプトアウト</a>）` : ""
      }</li>`
    )
    .join("");

  return `
  <section>
    <h2>アクセス解析ツールの利用</h2>
    <p>当サイトでは、以下のアクセス解析ツールを利用しています。</p>
    <ul>${tools}</ul>
  </section>`;
}


// ------------------------------------------------------------
// Cookie（クッキー）利用セクション
// ------------------------------------------------------------
// 【目的】
// Cookie の利用目的および無効化方法を説明。
// 【入力】data.cookies（purposes[], disableMethod）
// 【出力】<section>要素（Cookie使用の説明）
// ------------------------------------------------------------
function sectionCookies(data) {
  const cookies = data.cookies || {};
  return `
  <section>
    <h2>Cookie（クッキー）の使用について</h2>
    <p>当サイトでは、${(cookies.purposes || []).join("、") || "利便性向上やアクセス解析"} の目的でCookieを使用しています。</p>
    <p>Cookieの無効化は、${cookies.disableMethod || "各ブラウザの設定画面から行うことができます。"}。</p>
  </section>`;
}


// ------------------------------------------------------------
// 個人情報の管理体制セクション
// ------------------------------------------------------------
// 【目的】
// 安全管理措置（暗号化、権限制御、教育など）を明示。
// 【入力】data.security（measures[]）
// 【出力】<section>要素（管理措置の説明）
// ------------------------------------------------------------
function sectionSecurity(data) {
  const sec = data.security || {};
  return `
  <section>
    <h2>個人情報の管理体制</h2>
    <p>当サイトでは、${(sec.measures || ["SSL/TLS通信の暗号化", "アクセス権限の制限", "定期的な見直し"]).join("、")} などの措置を講じています。</p>
  </section>`;
}


// ------------------------------------------------------------
// 開示・訂正・削除等の請求セクション
// ------------------------------------------------------------
// 【目的】
// 利用者が自身の情報を請求・訂正・削除できる手続を説明。
// 【入力】data.userRights（contact, phone, address, procedure）
// 【出力】<section>要素（問い合わせ先と手順）
// ------------------------------------------------------------
function sectionUserRights(data) {
  const ur = data.userRights || {};
  return `
  <section>
    <h2>開示・訂正・削除等の請求について</h2>
    <p>利用者ご本人からの開示・訂正・削除等のご請求には、適切に対応いたします。</p>
    <ul>
      ${ur.contact ? `<li>メールアドレス：${ur.contact}</li>` : ""}
      ${ur.phone ? `<li>電話番号：${ur.phone}</li>` : ""}
      ${ur.address ? `<li>住所：${ur.address}</li>` : ""}
    </ul>
    ${ur.procedure ? `<p>${ur.procedure}</p>` : ""}
  </section>`;
}


// ------------------------------------------------------------
// 法令遵守および施行日セクション
// ------------------------------------------------------------
// 【目的】
// 法令準拠、ポリシー改訂、施行日などを記載。
// 【入力】data.legal（effectiveDate, governingLaw）
// 【出力】<section>要素（施行日および準拠法）
// ------------------------------------------------------------
function sectionLegal(data) {
  const lg = data.legal || {};
  return `
  <section>
    <h2>法令、規範の遵守と見直し</h2>
    <p>当サイトは、適用される日本の法令およびその他の規範を遵守し、継続的に見直しと改善を行います。</p>
    <p>本ポリシーは ${lg.effectiveDate || "制定日未設定"} より施行します。</p>
  </section>`;
}


// ------------------------------------------------------------
// 全セクションを統合し、最終HTMLを組み立て
// ------------------------------------------------------------
// 【目的】
// 各セクション生成関数を呼び出し、完全なHTML文書を構築。
// 【入力】generate.js から渡される JSON データ全体
// 【出力】プライバシーポリシーのHTML文字列
// ------------------------------------------------------------
export function buildPolicyHTML(data) {
  return `
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="utf-8">
    <title>${data.base?.siteName || "プライバシーポリシー"}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: system-ui, sans-serif; color:#333; line-height:1.7; padding:24px; max-width:880px; margin:auto; background:#fff; }
      h1 { font-size:1.8em; border-bottom:2px solid #333; padding-bottom:4px; margin-bottom:1em; }
      h2 { font-size:1.2em; margin-top:1.4em; border-left:4px solid #999; padding-left:8px; }
      p, li { margin-bottom:.6em; }
      ul { padding-left:1.2em; }
    </style>
  </head>
  <body>
    <h1>プライバシーポリシー</h1>
    <p>本プライバシーポリシーは、${data.base?.operatorName || "当サイト運営者"}（以下「当社」といいます）が運営する「${data.base?.siteName || "本サイト"}」における個人情報の取扱いについて定めるものです。</p>
    ${sectionCollection(data)}
    ${sectionPurposes(data)}
    ${sectionThirdParties(data)}
    ${sectionAnalytics(data)}
    ${sectionCookies(data)}
    ${sectionSecurity(data)}
    ${sectionUserRights(data)}
    ${sectionLegal(data)}
    <p style="margin-top:2em; font-size:.9em; color:#666;">以上</p>
  </body>
  </html>`;
}
