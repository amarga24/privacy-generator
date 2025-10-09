// ============================================================
// script.js
// ------------------------------------------------------------
// 概要: index.html のフォーム操作・プレビュー生成を制御する。
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
  const purposesWrap = $("#purposesWrap");
  const addPurposeRow = () => {
    purposesWrap.appendChild(createEl(`
      <div class="uk-margin-small">
        <input class="uk-input" data-k="purpose" placeholder="お客様からのお問い合わせに回答するため">
      </div>`));
  };
  $("#addPurpose").addEventListener("click", addPurposeRow);
  addPurposeRow();

  // ------------------------------------------------------------
  // アクセス解析フォーム
  // ------------------------------------------------------------
  const analyticsWrap = $("#analyticsWrap");
  const addAnalyticsRow = () => {
    analyticsWrap.appendChild(createEl(`
      <div class="uk-grid-small uk-margin-small" uk-grid>
        <div class="uk-width-1-4@m"><input class="uk-input" data-k="name" placeholder="ツール名"></div>
        <div class="uk-width-1-4@m"><input class="uk-input" data-k="provider" placeholder="提供者"></div>
        <div class="uk-width-1-4@m"><input class="uk-input" data-k="purpose" placeholder="目的"></div>
        <div class="uk-width-1-4@m"><input class="uk-input" data-k="optoutUrl" placeholder="オプトアウトURL"></div>
      </div>`));
  };
  $("#addAnalytics").addEventListener("click", addAnalyticsRow);
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

  noCheckPairs.forEach(p => {
    const cb = $(`[name="${p.check}"]`);
    const section = document.getElementById(p.sectionId);
    if (cb && section) {
      const updateFields = () => {
        section.querySelectorAll("input, textarea, select, button").forEach(el => {
          if (el === cb) return;
          el.disabled = cb.checked;
        });
      };

      // ページ読み込み時に実行
      updateFields();

      // チェック変更時にも実行
      cb.addEventListener("change", updateFields);
    }
  });

  // ------------------------------------------------------------
  // JSON変換ヘルパー
  // ------------------------------------------------------------
  const getInputValue = (el) => el?.value.trim() || "";
  const getVal = (form, n) => getInputValue(form.querySelector(`[name="${CSS.escape(n)}"]`));
  const getBool = (form, n) => !!form.querySelector(`[name="${CSS.escape(n)}"]`)?.checked;
  const toList = (s) => (s || "").split(",").map(x => x.trim()).filter(Boolean);

  const formToJSON = (form) => {
    const pv = [...purposesWrap.querySelectorAll(".uk-margin-small")].map(r => {
      const purpose = getInputValue(r.querySelector(`[data-k="purpose"]`));
      return purpose ? { description: purpose } : null;
    }).filter(p => p !== null);

    const tools = [...analyticsWrap.querySelectorAll(".uk-grid-small")].map(r => ({
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
        address: getVal(form, "base.address"),
        contactEmail: getVal(form, "base.contactEmail")
      },
      collection: {
        methods: toList(getVal(form, "collection.methods")),
        autoCollection: toList(getVal(form, "collection.autoCollection")),
        detail: getVal(form, "collection.detail"),
        noCollection: getBool(form, "collection.noCollection")
      },
      purposes: pv,
      purposesFlag: getBool(form, "purposes.noPurpose"),
      thirdParties: {
        detail: getVal(form, "thirdParties.detail"),
        entrustExamples: toList(getVal(form, "thirdParties.entrustExamples")),
        noThirdparty: getBool(form, "thirdParties.noThirdparty")
      },
      analytics: {
        noAnalytics: getBool(form, "analytics.noAnalytics"),
        tools
      },
      cookies: {
        purposes: toList(getVal(form, "cookies.purposes")),
        disableMethod: getVal(form, "cookies.disableMethod"),
        noCookies: getBool(form, "cookies.noCookies")
      },
      security: {
        measures: toList(getVal(form, "security.measures"))
      },
      userRights: {
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
  // HTML生成処理
  // ------------------------------------------------------------
  const preview = $("#preview");
  const dlBtn = $("#downloadBtn");

  $("#policyForm").addEventListener("submit", async e => {
    e.preventDefault();
    const json = formToJSON(e.target);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json)
      });

      const html = await res.text();
      preview.innerHTML = html;
      dlBtn.disabled = false;
    } catch (err) {
      preview.innerHTML = `<p class="uk-text-danger">エラーが発生しました。サーバーを確認してください。</p>`;
      console.error(err);
    }
  });

  // HTMLダウンロード機能
  dlBtn.addEventListener("click", () => {
    const content = preview.innerHTML;
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "privacy-policy.html";
    a.click();
    URL.revokeObjectURL(url);
  });

})();