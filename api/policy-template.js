// ============================================================
// api/policy-template.js
// ------------------------------------------------------------
// 概要: 入力データ（フォーム内容）を受け取り、
//       プライバシーポリシーHTML本文を生成する。
// 仕様: 
//  1. 「該当なし」チェックがON時 → セクション全体を非表示
//  2. 「該当なし」チェックがOFF + 入力あり → 入力値をそのまま出力
//  3. 「該当なし」チェックがOFF + 入力なし → プレースホルダー + 赤字「※要修正※」
//  4. 管理体制セクションにはチェックボックスなし（未入力時は赤字＋プレースホルダー）
//  5. お問い合わせ・開示等の請求では、base.contactEmailを使用
// ============================================================

// ------------------------------------------------------------
// ヘルパー関数
// ------------------------------------------------------------

// HTMLエスケープ
function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 未入力時に赤字＋プレースホルダーを表示（エスケープ済みテキストまたは未エスケープのプレースホルダー）
function withPlaceholder(val, placeholder) {
  if (val && String(val).trim() !== "") return escapeHTML(String(val).trim());
  return `<span class="uk-text-danger">（※要修正※）</span>${placeholder}`;
}

// ------------------------------------------------------------
// メインHTML生成関数
// ------------------------------------------------------------
export function buildPolicyHTML(data) {
  const base = data.base || {};
  const userRights = data.userRights || {};

  const site = withPlaceholder(base.siteName, "サイト名未設定");
  const operator = withPlaceholder(base.operatorName, "運営者名未設定");
  const representative = base.representative && String(base.representative).trim()
    ? escapeHTML(base.representative)
    : "";
  const address = base.address && String(base.address).trim()
    ? escapeHTML(base.address)
    : "";
  const contactEmail = withPlaceholder(base.contactEmail, "メールアドレス未設定");
  const date = withPlaceholder(data.legal?.effectiveDate, "施行日未設定");

  // ------------------------------------------------------------
  // 個人情報の取得方法
  // ------------------------------------------------------------
  let sectionCollection = "";
  console.log("[DEBUG] collection.noCollection の値:", data.collection?.noCollection);
  console.log("[DEBUG] collection.noCollection の型:", typeof data.collection?.noCollection);
  console.log("[DEBUG] 条件判定結果:", data.collection?.noCollection !== true);

  if (data.collection?.noCollection !== true) {
    console.log("[DEBUG] → 個人情報の取得方法セクションを表示します");

    const methodsArray = data.collection?.methods || [];
    const methodsText = methodsArray.filter(m => m && m.trim()).join("、");
    const methods = methodsText
      ? escapeHTML(methodsText)
      : `<span class="uk-text-danger">（※要修正※）</span>ユーザー入力による取得（例：お問い合わせフォーム、会員登録など）`;

    const autoArray = data.collection?.autoCollection || [];
    const autoText = autoArray.filter(a => a && a.trim()).join("、");
    const auto = autoText
      ? escapeHTML(autoText)
      : `<span class="uk-text-danger">（※要修正※）</span>自動取得される情報（例：アクセスログ、Cookie、IPアドレスなど）`;

    const detailText = data.collection?.detail || "";
    const detail = detailText.trim()
      ? escapeHTML(detailText)
      : `<span class="uk-text-danger">（※要修正※）</span>補足説明（例：これらの情報はサービス提供や不正防止のために利用）`;

    sectionCollection = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の取得方法</h3>
      <p><strong>ユーザー入力による取得：</strong><br>${methods}</p>
      <p><strong>自動取得される情報：</strong><br>${auto}</p>
      <p><strong>補足説明：</strong><br>${detail}</p>
    </section>`;
  } else {
    console.log("[DEBUG] → 個人情報の取得方法セクションを非表示にします");
  }

  // ------------------------------------------------------------
  // 個人情報の利用目的
  // ------------------------------------------------------------
  // ------------------------------------------------------------
  // 個人情報の利用目的
  // ------------------------------------------------------------
  let sectionPurposes = "";
  if (data.purposesFlag !== true) {
    const purposes = (data.purposes || [])
      .filter(p => p.description && p.description.trim())
      .map((p) => {
        return `<li>${escapeHTML(p.description)}</li>`;
      });

    const content = purposes.length
      ? `<ul>${purposes.join("")}</ul>`
      : `<p><span class="uk-text-danger">（※要修正※）</span>利用目的未入力（例：お客様からのお問い合わせに回答するため）</p>`;

    sectionPurposes = `
  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">個人情報の利用目的</h3>
    <p>当サイトが取得した個人情報は、以下の目的のために利用いたします。</p>
    ${content}
  </section>`;
  }

  // ------------------------------------------------------------
  // 第三者提供・委託
  // ------------------------------------------------------------
  let sectionThird = "";
  if (data.thirdParties?.noThirdparty !== true) {
    const detailText = data.thirdParties?.detail || "";
    const detail = detailText.trim()
      ? escapeHTML(detailText)
      : `<span class="uk-text-danger">（※要修正※）</span>第三者提供・委託に関する説明（例：法令に基づく場合を除き、第三者への提供および委託は行う場合があります。）`;

    const examplesArray = data.thirdParties?.entrustExamples || [];
    const examplesText = examplesArray.filter(e => e && e.trim()).join("、");
    const examples = examplesText
      ? escapeHTML(examplesText)
      : `<span class="uk-text-danger">（※要修正※）</span>委託先の例（例：さくらインターネット株式会社（サーバーホスティング）、GMOペイメントゲートウェイ株式会社（決済代行）、ヤマト運輸株式会社（配送業務））`;

    sectionThird = `
  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">個人情報の第三者提供および委託</h3>
    <p>第三者提供・委託に関する説明：<br>${detail}</p>
    <p>委託先の例：<br>${examples}</p>
  </section>`;
  }

  // ------------------------------------------------------------
  // アクセス解析
  // ------------------------------------------------------------
  let sectionAnalytics = "";
  if (data.analytics?.noAnalytics !== true) {
    const tools = (data.analytics?.tools || [])
      .filter(t => t.name || t.provider || t.purpose || t.optoutUrl)
      .map((t) => {
        const name = t.name && t.name.trim()
          ? escapeHTML(t.name)
          : `<span class="uk-text-danger">（※要修正※）</span>ツール名未入力`;
        const provider = t.provider && t.provider.trim()
          ? `（提供者：${escapeHTML(t.provider)}）`
          : "";
        const purpose = t.purpose && t.purpose.trim()
          ? escapeHTML(t.purpose)
          : `<span class="uk-text-danger">（※要修正※）</span>目的未入力`;
        const optout = t.optoutUrl && t.optoutUrl.trim()
          ? `<br>オプトアウトURL：<a href="${escapeHTML(t.optoutUrl)}" target="_blank">${escapeHTML(t.optoutUrl)}</a>`
          : "";
        return `<li>${name}${provider}：${purpose}${optout}</li>`;
      });

    const content = tools.length
      ? `<ul>${tools.join("")}</ul>`
      : `<p><span class="uk-text-danger">（※要修正※）</span>解析ツール未入力</p>`;

    sectionAnalytics = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">アクセス解析ツールの使用</h3>
      <p>当サイトでは、以下のアクセス解析ツールを利用しています。</p>
      ${content}
    </section>`;
  }

  // ------------------------------------------------------------
  // Cookie
  // ------------------------------------------------------------
  let sectionCookies = "";
  if (data.cookies?.noCookies !== true) {
    const purposesArray = data.cookies?.purposes || [];
    const purposesText = purposesArray.filter(p => p && p.trim()).join("、");
    const purposes = purposesText
      ? escapeHTML(purposesText)
      : `<span class="uk-text-danger">（※要修正※）</span>Cookie使用目的未入力（例：利便性向上、アクセス解析、広告配信など）`;

    const disableText = data.cookies?.disableMethod || "";
    const disable = disableText.trim()
      ? escapeHTML(disableText)
      : `<span class="uk-text-danger">（※要修正※）</span>無効化方法未入力（例：ブラウザ設定からCookieを無効化できます）`;

    sectionCookies = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">Cookie（クッキー）の使用について</h3>
      <p>
        当サイトでは、${purposes}の目的でCookieを使用しています。<br>
        ${disable}
      </p>
    </section>`;
  }

  // ------------------------------------------------------------
  // 管理体制（該当なしチェックなし）
  // ------------------------------------------------------------
  const measuresArray = data.security?.measures || [];
  const measuresText = measuresArray.filter(m => m && m.trim()).join("、");
  const securityText = measuresText
    ? escapeHTML(measuresText)
    : `<span class="uk-text-danger">（※要修正※）</span>セキュリティ対策未入力（例：SSL/TLS通信暗号化、アクセス制御、定期的な見直し）`;

  const sectionSecurity = `
  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">個人情報の管理体制</h3>
    <p>${securityText}</p>
  </section>`;

  // ------------------------------------------------------------
  // 開示・訂正・削除等の請求について
  // ------------------------------------------------------------
  let contactOutput = "";
  if (base.contactEmail && base.contactEmail.trim()) {
    contactOutput = `メール：<a href="mailto:${escapeHTML(base.contactEmail)}">${escapeHTML(base.contactEmail)}</a><br>`;
  } else {
    contactOutput = `<span class="uk-text-danger">（※要修正※）</span>メールアドレス未設定<br>`;
  }

  if (userRights.phone && userRights.phone.trim()) {
    contactOutput += `電話：${escapeHTML(userRights.phone)}<br>`;
  }

  const procedure = userRights.procedure && userRights.procedure.trim()
    ? `<p>${escapeHTML(userRights.procedure)}</p>`
    : "";

  // ------------------------------------------------------------
  // HTML全体組み立て
  // ------------------------------------------------------------
  return `
<article class="uk-article policy-content uk-margin-large-top">

  <h2 class="uk-heading-bullet">プライバシーポリシー</h2>
  <p>
    本プライバシーポリシーは、${operator}
    ${representative ? `（代表者：${representative}）` : ""}
    が運営する「${site}」（以下「本サイト」といいます。）における個人情報の取扱いについて定めるものです。
  </p>
  <p>
    ${address ? `所在地：${address}<br>` : ""}
    お問い合わせ：<a href="mailto:${escapeHTML(base.contactEmail || "")}">${contactEmail}</a>
  </p>

  ${sectionCollection}
  ${sectionPurposes}
  ${sectionThird}
  ${sectionAnalytics}
  ${sectionCookies}
  ${sectionSecurity}

  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">開示・訂正・削除等の請求について</h3>
    <p>
      利用者ご本人からの開示・訂正・削除等のご請求には、適切かつ迅速に対応いたします。<br>
      ご連絡は以下の方法でお願いいたします：<br>
      ${contactOutput}
    </p>
    ${procedure}
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">法令・規範の遵守と見直し</h3>
    <p>
      当サイトは、適用される日本の法令およびその他の規範を遵守し、
      継続的に見直しと改善を行います。
    </p>
  </section>

  <p class="policy-date uk-text-meta uk-margin-top">
    本ポリシーは ${date} より施行します。
  </p>

  <p class="uk-text-right uk-margin-remove-bottom">以上</p>
</article>`;
}