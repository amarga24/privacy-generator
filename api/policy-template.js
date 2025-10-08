// ============================================================
// api/policy-template.js (改善版)
// ------------------------------------------------------------
// 概要: 入力データ（フォーム内容）を受け取り、
//       プライバシーポリシーHTML本文を生成する。
// 改善点:
//  1. UIKit3のアラートボックスを使用して警告を表示
//  2. 未入力項目を明確に識別できるようにする
//  3. 視認性の向上
// ============================================================

// ------------------------------------------------------------
// ヘルパー関数
// ------------------------------------------------------------

// 未入力時にUIKitアラートボックス＋プレースホルダーを表示
function withPlaceholder(val, placeholder) {
  const trimmed = String(val || "").trim();
  if (trimmed !== "") return escapeHTML(trimmed);
  
  return `<div class="uk-alert-warning" uk-alert>
    <p><strong>⚠ 要修正:</strong> ${escapeHTML(placeholder)}</p>
  </div>`;
}

// HTMLエスケープ
function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// リスト項目用の警告表示（インライン）
function withInlinePlaceholder(val, placeholder) {
  const trimmed = String(val || "").trim();
  if (trimmed !== "") return escapeHTML(trimmed);
  
  return `<span class="uk-text-warning"><strong>⚠ 要修正:</strong> ${escapeHTML(placeholder)}</span>`;
}

// ------------------------------------------------------------
// メインHTML生成関数
// ------------------------------------------------------------
export function buildPolicyHTML(data) {
  const base = data.base || {};
  const userRights = data.userRights || {};

  const site = withInlinePlaceholder(base.siteName, "サイト名未設定");
  const operator = withInlinePlaceholder(base.operatorName, "運営者名未設定");
  const representative = base.representative ? escapeHTML(base.representative) : "";
  const address = base.address ? escapeHTML(base.address) : "";
  const email = withInlinePlaceholder(base.contactEmail, "メールアドレス未設定");
  const date = withInlinePlaceholder(data.legal?.effectiveDate, "施行日未設定");

  // ------------------------------------------------------------
  // 個人情報の取得方法
  // ------------------------------------------------------------
  let sectionCollection = "";
  if (data.collection?.noCollection !== true) {
    const methodsVal = (data.collection?.methods || []).join("、");
    const autoVal = (data.collection?.autoCollection || []).join("、");
    const detailVal = data.collection?.detail;

    const methods = methodsVal 
      ? escapeHTML(methodsVal)
      : withPlaceholder("", "ユーザー入力による取得（例：お問い合わせフォーム、会員登録など）");
    
    const auto = autoVal
      ? escapeHTML(autoVal)
      : withPlaceholder("", "自動取得される情報（例：アクセスログ、Cookie、IPアドレスなど）");
    
    const detail = detailVal
      ? escapeHTML(detailVal)
      : withPlaceholder("", "補足説明（例：これらの情報はサービス提供や不正防止のために利用）");

    sectionCollection = `
    <section class="uk-section uk-section-small">
      <h3 class="uk-heading-bullet">個人情報の取得方法</h3>
      <div class="uk-margin-small">
        <strong>ユーザー入力による取得：</strong><br>${methods}
      </div>
      <div class="uk-margin-small">
        <strong>自動取得される情報：</strong><br>${auto}
      </div>
      <div class="uk-margin-small">
        <strong>補足説明：</strong><br>${detail}
      </div>
    </section>`;
  }

  // ------------------------------------------------------------
  // 個人情報の利用目的
  // ------------------------------------------------------------
  let sectionPurposes = "";
  if (data.purposesFlag !== true) {
    const purposes = (data.purposes || []).map((p) => {
      const cat = withInlinePlaceholder(p.category, "カテゴリ未入力");
      const tgt = p.target ? `（${escapeHTML(p.target)}）` : "";
      const desc = withInlinePlaceholder(p.description, "説明未入力");
      return `<li>${cat}${tgt}：${desc}</li>`;
    });

    const content = purposes.length
      ? `<ul class="uk-list uk-list-bullet">${purposes.join("")}</ul>`
      : withPlaceholder("", "利用目的が入力されていません。具体的な利用目的を記載してください。");

    sectionPurposes = `
    <section class="uk-section uk-section-small">
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
    const detailVal = data.thirdParties?.detail;
    const examplesVal = (data.thirdParties?.entrustExamples || []).join("、");

    const detail = detailVal
      ? escapeHTML(detailVal)
      : withPlaceholder("", "第三者提供・委託に関する説明（例：法令に基づく場合を除き、第三者への提供および委託は行いません。）");
    
    const examples = examplesVal
      ? escapeHTML(examplesVal)
      : withPlaceholder("", "委託先の例（例：サーバー会社、決済代行業者など）");

    sectionThird = `
    <section class="uk-section uk-section-small">
      <h3 class="uk-heading-bullet">個人情報の第三者提供および委託</h3>
      <div class="uk-margin-small">
        <strong>第三者提供・委託に関する説明：</strong><br>${detail}
      </div>
      <div class="uk-margin-small">
        <strong>委託先の例：</strong><br>${examples}
      </div>
    </section>`;
  }

  // ------------------------------------------------------------
  // アクセス解析
  // ------------------------------------------------------------
  let sectionAnalytics = "";
  if (data.analytics?.noAnalytics !== true) {
    const tools = (data.analytics?.tools || []).map((t) => {
      const name = withInlinePlaceholder(t.name, "ツール名未入力");
      const provider = t.provider ? `（提供者：${escapeHTML(t.provider)}）` : "";
      const purpose = withInlinePlaceholder(t.purpose, "目的未入力");
      const optout = t.optoutUrl
        ? `<br>オプトアウトURL：<a href="${escapeHTML(t.optoutUrl)}" target="_blank" class="uk-link-text">${escapeHTML(t.optoutUrl)}</a>`
        : "";
      return `<li>${name}${provider}：${purpose}${optout}</li>`;
    });

    const content = tools.length
      ? `<ul class="uk-list uk-list-bullet">${tools.join("")}</ul>`
      : withPlaceholder("", "解析ツールが入力されていません。使用している解析ツールを記載してください。");

    sectionAnalytics = `
    <section class="uk-section uk-section-small">
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
    const purposesVal = (data.cookies?.purposes || []).join("、");
    const disableVal = data.cookies?.disableMethod;

    const purposes = purposesVal
      ? escapeHTML(purposesVal)
      : withInlinePlaceholder("", "Cookie使用目的未入力（例：利便性向上、アクセス解析、広告配信など）");
    
    const disable = disableVal
      ? escapeHTML(disableVal)
      : withInlinePlaceholder("", "無効化方法未入力（例：ブラウザ設定からCookieを無効化できます）");

    sectionCookies = `
    <section class="uk-section uk-section-small">
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
  const measuresVal = (data.security?.measures || []).join("、");
  const securityText = measuresVal
    ? escapeHTML(measuresVal)
    : withPlaceholder("", "セキュリティ対策未入力（例：SSL/TLS通信暗号化、アクセス制御、定期的な見直し）");
  
  const sectionSecurity = `
  <section class="uk-section uk-section-small">
    <h3 class="uk-heading-bullet">個人情報の管理体制</h3>
    <p>当サイトでは、個人情報の漏洩、滅失、毀損の防止その他の安全管理のため、以下の対策を講じています。</p>
    ${securityText}
  </section>`;

  // ------------------------------------------------------------
  // 開示・訂正・削除等の請求について
  // ------------------------------------------------------------
  let contactOutput = "";
  if (userRights.contact || userRights.phone) {
    contactOutput = `
      <div class="uk-margin-small">
      ${userRights.contact ? `メール：<a href="mailto:${escapeHTML(userRights.contact)}" class="uk-link-text">${escapeHTML(userRights.contact)}</a><br>` : ""}
      ${userRights.phone ? `電話：${escapeHTML(userRights.phone)}<br>` : ""}
      </div>
    `;
  } else {
    contactOutput = withPlaceholder("", "連絡先未設定（メールまたは電話番号のいずれかを入力してください）");
  }

  const procedureText = userRights.procedure 
    ? `<p>${escapeHTML(userRights.procedure)}</p>`
    : withPlaceholder("", "手続き方法の説明（例：本人確認の上、速やかに対応いたします（通常1週間以内））");

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
    ${address ? `<br>所在地：${address}` : ""}
  </p>

  ${sectionCollection}
  ${sectionPurposes}
  ${sectionThird}
  ${sectionAnalytics}
  ${sectionCookies}
  ${sectionSecurity}

  <section class="uk-section uk-section-small">
    <h3 class="uk-heading-bullet">開示・訂正・削除等の請求について</h3>
    <p>
      利用者ご本人からの開示・訂正・削除等のご請求には、適切かつ迅速に対応いたします。<br>
      ご連絡は以下の方法でお願いいたします：
    </p>
    ${contactOutput}
    ${procedureText}
  </section>

  <section class="uk-section uk-section-small">
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