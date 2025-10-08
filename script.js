// ============================================================
// script.js (完成版)
// ------------------------------------------------------------
// 改善点:
// 1. ページ読み込み時に「該当なし」チェックの初期状態を反映
// 2. 発効日を今日の日付で自動設定
// 3. ダウンロード機能を追加
// ============================================================

(function () {

  const $ = (s) => document.querySelector(s);
  const createEl = (html) => {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  };

  // ------------------------------------------------------------
  // 利用目的フォーム
  // ------------------------------------------------------------
  const purposesWrap = document.getElementById("purposesWrap");
  const addPurposeRow = () => {
    purposesWrap.appendChild(createEl(`
      <div class="uk-grid-small uk-margin-small" uk-grid>
        <div class="uk-width-1-3@s"><input class="uk-input" data-k="category" placeholder="カテゴリ"></div>
        <div class="uk-width-1-3@s"><input class="uk-input" data-k="target" placeholder="対象"></div>
        <div class="uk-width-1-3@s"><input class="uk-input" data-k="description" placeholder="説明"></div>
      </div>`));
  };
  document.getElementById("addPurpose").addEventListener("click", addPurposeRow);
  addPurposeRow();

  // ------------------------------------------------------------
  // アクセス解析フォーム
  // ------------------------------------------------------------
  const analyticsWrap = document.getElementById("analyticsWrap");
  const addAnalyticsRow = () => {
    analyticsWrap.appendChild(createEl(`
      <div class="uk-grid-small uk-margin-small" uk-grid>
        <div class="uk-width-1-4@m"><input class="uk-input" data-k="name" placeholder="ツール名"></div>
        <div class="uk-width-1-4@m"><input class="uk-input" data-k="provider" placeholder="提供者"></div>
        <div class="uk-width-1-4@m"><input class="uk-input" data-k="purpose" placeholder="目的"></div>
        <div class="uk-width-1-4@m"><input class="uk-input" data-k="optoutUrl" placeholder="オプトアウトURL"></div>
      </div>`));
  };
  document.getElementById("addAnalytics").addEventListener("click", addAnalyticsRow);
  addAnalyticsRow();

  // ------------------------------------------------------------
  // 「該当なし」チェック連動
  // ------------------------------------------------------------
  const noCheckPairs = [
    { check: "collection.noCollection", sectionId: "collectionSection" },
    { check: "purposes.noPurpose", sectionId: "purposesSection" },
    { check: "thirdParties.noThirdparty", sectionId: "thirdPartiesSection" },
    { check: "analytics.noAnalytics", sectionId: "analyticsSection" },
    { check: "cookies.noCookies", sectionId: "cookiesSection" }
  ];

  const updateSectionState = (checkbox, section) => {
    section.querySelectorAll("input, textarea, select, button").forEach(el => {
      if (el === checkbox) return;
      el.disabled = checkbox.checked;
    });
  };

  noCheckPairs.forEach(p => {
    const cb = document.querySelector(`[name="${p.check}"]`);
    const section = document.getElementById(p.sectionId);
    if (cb && section) {
      // 初期状態を反映
      updateSectionState(cb, section);
      
      // 変更時にも反映
      cb.addEventListener("change", () => {
        updateSectionState(cb, section);
      });
    }
  });

  // ------------------------------------------------------------
  // 発効日の自動設定
  // ------------------------------------------------------------
  const dateInput = document.querySelector('[name="legal.effectiveDate"]');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // ------------------------------------------------------------
  // JSON変換ヘルパー
  // ------------------------------------------------------------
  const getInputValue = (el) => el?.value.trim() || "";
  const getVal = (form, n) => getInputValue(form.querySelector(`[name="${CSS.escape(n)}"]`));
  const getBool = (form, n) => !!form.querySelector(`[name="${CSS.escape(n)}"]`)?.checked;
  const toList = (s) => (s || "").split(",").map(x => x.trim()).filter(Boolean);

  const formToJSON = (form) => {
    // 「該当なし」チェックの状態を先に取得
    const noCollection = getBool(form, "collection.noCollection");
    const noPurpose = getBool(form, "purposes.noPurpose");
    const noThirdparty = getBool(form, "thirdParties.noThirdparty");
    const noAnalytics = getBool(form, "analytics.noAnalytics");
    const noCookies = getBool(form, "cookies.noCookies");

    // 利用目的: 「該当なし」がOFFの場合のみ値を取得
    const pv = noPurpose ? [] : [...purposesWrap.querySelectorAll(".uk-grid-small")].map(r => ({
      category: getInputValue(r.querySelector(`[data-k="category"]`)),
      target: getInputValue(r.querySelector(`[data-k="target"]`)),
      description: getInputValue(r.querySelector(`[data-k="description"]`))
    })).filter(p => p.category || p.target || p.description);

    // アクセス解析: 「該当なし」がOFFの場合のみ値を取得
    const tools = noAnalytics ? [] : [...analyticsWrap.querySelectorAll(".uk-grid-small")].map(r => ({
      name: getInputValue(r.querySelector(`[data-k="name"]`)),
      provider: getInputValue(r.querySelector(`[data-k="provider"]`)),
      purpose: getInputValue(r.querySelector(`[data-k="purpose"]`)),
      optoutUrl: getInputValue(r.querySelector(`[data-k="optoutUrl"]`))
    })).filter(t => t.name);

    return {
      base: {
        siteName: getVal(form, "base.siteName"),
        operatorName: getVal(form, "base.operatorName"),
        representative: getVal(form, "base.representative"),
        address: getVal(form, "base.address")
      },
      collection: {
        methods: noCollection ? [] : toList(getVal(form, "collection.methods")),
        autoCollection: noCollection ? [] : toList(getVal(form, "collection.autoCollection")),
        detail: noCollection ? "" : getVal(form, "collection.detail"),
        noCollection: noCollection
      },
      purposes: pv,
      purposesFlag: noPurpose,
      thirdParties: {
        detail: noThirdparty ? "" : getVal(form, "thirdParties.detail"),
        entrustExamples: noThirdparty ? [] : toList(getVal(form, "thirdParties.entrustExamples")),
        noThirdparty: noThirdparty
      },
      analytics: {
        noAnalytics: noAnalytics,
        tools: tools
      },
      cookies: {
        purposes: noCookies ? [] : toList(getVal(form, "cookies.purposes")),
        disableMethod: noCookies ? "" : getVal(form, "cookies.disableMethod"),
        noCookies: noCookies
      },
      security: {
        measures: toList(getVal(form, "security.measures"))
      },
      userRights: {
        contact: getVal(form, "userRights.contact"),
        phone: getVal(form, "userRights.phone"),
        procedure: getVal(form, "userRights.procedure")
      },
      legal: {
        effectiveDate: getVal(form, "legal.effectiveDate"),
        governingLaw: getVal(form, "legal.governingLaw")
      }
    };
  };

  // ------------------------------------------------------------
  // HTML生成・プレビュー処理
  // ------------------------------------------------------------
  const preview = document.getElementById("preview");
  const dlBtn = document.getElementById("downloadBtn");
  let generatedHTML = "";

  document.getElementById("policyForm").addEventListener("submit", async e => {
    e.preventDefault();
    const json = formToJSON(e.target);

    // デバッグ用: 送信されるJSONをコンソールに出力
    console.log("🔍 送信されるJSON:", JSON.stringify(json, null, 2));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      generatedHTML = await res.text();
      preview.innerHTML = generatedHTML;
      dlBtn.disabled = false;
    } catch (err) {
      preview.innerHTML = `<p class="uk-text-danger">エラーが発生しました: ${err.message}</p>`;
      console.error(err);
      dlBtn.disabled = true;
    }
  });

  // ------------------------------------------------------------
  // HTMLダウンロード機能
  // ------------------------------------------------------------
  dlBtn.addEventListener("click", () => {
    if (!generatedHTML) return;

    const fullHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>プライバシーポリシー</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.24.0/dist/css/uikit.min.css" />
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
      background: #fff;
    }
    h2, h3 { margin-top: 2rem; }
    .policy-date { margin-top: 3rem; border-top: 1px solid #ddd; padding-top: 1rem; }
    .uk-text-danger { color: #f0506e; font-weight: bold; }
  </style>
</head>
<body>
${generatedHTML}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "privacy-policy.html";
    a.click();
    URL.revokeObjectURL(url);
  });

})();