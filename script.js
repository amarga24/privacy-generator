// ============================================================
// script.js
// ------------------------------------------------------------
// 概要: index.html のフォーム操作・プレビュー生成を制御する。
// 構成: UIkit3 を利用した動的フォーム＋サーバーレス呼び出し。
// 注意: 入力データは保存されず、ローカルでのみ一時保持。
// ============================================================

(function () {

  // ------------------------------------------------------------
  // DOMヘルパー関数
  // ------------------------------------------------------------
  const $ = (s) => document.querySelector(s);
  const createEl = (html) => {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  };

  // ------------------------------------------------------------
  // 利用目的フォームの動的追加
  // ------------------------------------------------------------
  const purposesWrap = $("#purposesWrap");

  const addPurposeRow = () => {
    purposesWrap.appendChild(createEl(`
      <div class="uk-grid-small uk-margin-small" uk-grid>
        <div class="uk-width-1-3@s">
          <label class="uk-form-label">カテゴリ</label>
          <input class="uk-input" data-k="category" placeholder="商品発送">
        </div>
        <div class="uk-width-1-3@s">
          <label class="uk-form-label">対象</label>
          <input class="uk-input" data-k="target" placeholder="お客様">
        </div>
        <div class="uk-width-1-3@s">
          <label class="uk-form-label">説明</label>
          <input class="uk-input" data-k="description" placeholder="お問い合わせ対応、サービス改善のため">
        </div>
      </div>
    `));
  };

  $("#addPurpose").addEventListener("click", addPurposeRow);
  addPurposeRow(); // 初期行


  // ------------------------------------------------------------
  // アクセス解析フォームの動的追加
  // ------------------------------------------------------------
  const analyticsWrap = $("#analyticsWrap");

  const addAnalyticsRow = () => {
    analyticsWrap.appendChild(createEl(`
      <div class="uk-grid-small uk-margin-small" uk-grid>
        <div class="uk-width-1-4@m">
          <label class="uk-form-label">ツール名</label>
          <input class="uk-input" data-k="name" placeholder="Google Analytics 4">
        </div>
        <div class="uk-width-1-4@m">
          <label class="uk-form-label">提供者</label>
          <input class="uk-input" data-k="provider" placeholder="Google LLC">
        </div>
        <div class="uk-width-1-4@m">
          <label class="uk-form-label">目的</label>
          <input class="uk-input" data-k="purpose" placeholder="利用状況の分析">
        </div>
        <div class="uk-width-1-4@m">
          <label class="uk-form-label">オプトアウトURL</label>
          <input class="uk-input" data-k="optoutUrl" placeholder="https://tools.google.com/dlpage/gaoptout">
        </div>
      </div>
    `));
  };

  $("#addAnalytics").addEventListener("click", addAnalyticsRow);
  addAnalyticsRow(); // 初期行


// ------------------------------------------------------------
// 入力補助関数
// ------------------------------------------------------------
const getInputValue = (el) => el?.value.trim() || "";

// ドットを含む name 属性を正しく検索できるよう修正
const get = (form, n) => form.querySelector(`[name="${CSS.escape(n)}"]`);

const getVal = (form, n) => getInputValue(get(form, n));
const getBool = (form, n) => !!get(form, n)?.checked;
const toList = (s) => (s || "").split(",").map(x => x.trim()).filter(Boolean);



  // ------------------------------------------------------------
  // フォームデータ → JSON変換
  // ------------------------------------------------------------
  const formToJSON = (form) => {
    const pv = [...purposesWrap.querySelectorAll(".uk-grid-small")].map(r => {
      const g = k => getInputValue(r.querySelector(`[data-k="${k}"]`));
      return { category: g("category"), target: g("target"), description: g("description") };
    }).filter(p => p.category || p.target || p.description);

    const tools = [...analyticsWrap.querySelectorAll(".uk-grid-small")].map(r => {
      const g = k => getInputValue(r.querySelector(`[data-k="${k}"]`));
      return { name: g("name"), provider: g("provider"), purpose: g("purpose"), optoutUrl: g("optoutUrl") };
    }).filter(t => t.name);

    return {
      base: {
        siteName: getVal(form, "base.siteName"),
        operatorName: getVal(form, "base.operatorName"),
        contactEmail: getVal(form, "base.contactEmail"),
        address: getVal(form, "base.address"),
        representative: getVal(form, "base.representative")
      },
      collection: {
        methods: toList(getVal(form, "collection.methods")),
        autoCollection: toList(getVal(form, "collection.autoCollection")),
        detail: getVal(form, "collection.detail")
      },
      purposes: pv,
      thirdParties: {
        hasProvision: getBool(form, "thirdParties.hasProvision"),
        detail: getVal(form, "thirdParties.detail"),
        entrustsProcessing: getBool(form, "thirdParties.entrustsProcessing"),
        entrustExamples: toList(getVal(form, "thirdParties.entrustExamples"))
      },
      analytics: {
        useAnalytics: getBool(form, "analytics.useAnalytics"),
        tools
      },
      cookies: {
        purposes: toList(getVal(form, "cookies.purposes")),
        disableMethod: getVal(form, "cookies.disableMethod")
      },
      security: {
        measures: toList(getVal(form, "security.measures"))
      },
      userRights: {
        contact: getVal(form, "userRights.contact"),
        phone: getVal(form, "userRights.phone"),
        address: getVal(form, "userRights.address"),
        procedure: getVal(form, "userRights.procedure")
      },
      legal: {
        effectiveDate: getVal(form, "legal.effectiveDate"),
        governingLaw: getVal(form, "legal.governingLaw")
      }
    };
  };


  // ------------------------------------------------------------
  // HTMLプレビュー生成とダウンロード機能
  // ------------------------------------------------------------
  const preview = $("#preview");
  const dlBtn = $("#downloadBtn");

  $("#policyForm").addEventListener("submit", async e => {
    e.preventDefault();
    dlBtn.disabled = true;

    const form = e.currentTarget;
    const json = formToJSON(form);

    // API呼び出し
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json)
    });

    const html = await res.text();
    preview.innerHTML = html;

    // ダウンロード用Blob生成
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    dlBtn.disabled = false;
    dlBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = "privacy-policy.html";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    };
  });

})();
