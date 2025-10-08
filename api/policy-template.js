// ============================================================
// api/policy-template.js
// ------------------------------------------------------------
// 概要: 入力データ（フォーム内容）を受け取り、
//       プライバシーポリシーHTML本文を生成する。
// 仕様: 
//  1. 「該当なし」チェックがあるセクションは、チェックON時のみ非表示。
//  2. チェックOFFで未入力の場合 → プレースホルダーの内容を出力し、
//     先頭に <span class="uk-text-danger">（※要修正※）</span> を付与。
//  3. uk-alert-danger, uk-alert は使用しない。
//  4. 管理体制セクションにはチェックボックスなし。
//     未入力時は同様に赤字＋プレースホルダーを出力。
// ============================================================

// ------------------------------------------------------------
// ヘルパー関数
// ------------------------------------------------------------

// 未入力時に赤字＋プレースホルダーを表示
function withPlaceholder(val, placeholder) {
  if (val && String(val).trim() !== "") return String(val).trim();
  return `<span class="uk-text-danger">（※要修正※）</span>${placeholder}`;
}

// HTMLエスケープ
function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ------------------------------------------------------------
// メインHTML生成関数
// ------------------------------------------------------------
export function buildPolicyHTML(data) {
  const base = data.base || {};
  const userRights = data.userRights || {};

  const site = withPlaceholder(base.siteName, "サイト名未設定");
  const operator = withPlaceholder(base.operatorName, "運営者名未設定");
  const email = withPlaceholder(base.contactEmail, "メールアドレス未設定");
  const date = withPlaceholder(data.legal?.effectiveDate, "施行日未設定");

  // ============================================================
  // ① 個人情報の取得方法
  // ============================================================
  let sectionCollection = "";
  if (data.collection?.noCollection !== true) {
    const methods = withPlaceholder(
      (data.collection?.methods || []).join("、"),
      "ユーザー入力による取得（例：お問い合わせフォーム、会員登録など）"
    );
    const auto = withPlaceholder(
      (data.collection?.autoCollection || []).join("、"),
      "自動取得される情報（例：アクセスログ、Cookie、IPアドレスなど）"
    );
    const detail = withPlaceholder(
      data.collection?.detail,
      "補足説明（例：これらの情報はサービス提供や不正防止のために利用）"
    );

    sectionCollection = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の取得方法</h3>
      <p><strong>ユーザー入力による取得：</strong><br>${methods}</p>
      <p><strong>自動取得される情報：</strong><br>${auto}</p>
      <p><strong>補足説明：</strong><br>${detail}</p>
    </section>`;
  }

  // ============================================================
  // ② 利用目的
  // ============================================================
  let sectionPurposes = "";
  if (data.purposesFlag !== true) {
    const purposes = (data.purposes || []).map((p) => {
      const cat = withPlaceholder(p.category, "カテゴリ未入力");
      const tgt = p.target ? `（${escapeHTML(p.target)}）` : "";
      const desc = withPlaceholder(p.description, "説明未入力");
      return `<li>${cat}${tgt}：${desc}</li>`;
    });

    const content = purposes.length
      ? `<ul>${purposes.join("")}</ul>`
      : `<p>${withPlaceholder("", "利用目的未入力")}</p>`;

    sectionPurposes = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の利用目的</h3>
      <p>当サイトが取得した個人情報は、以下の目的のために利用いたします。</p>
      ${content}
    </section>`;
  }

  // ============================================================
  // ③ 第三者提供・委託
  // ============================================================
  let sectionThird = "";
  if (data.thirdParties?.noThirdparty !== true) {

    // 第三者提供・委託に関する説明
    const detail = withPlaceholder(
      data.thirdParties?.detail,
      "第三者提供・委託に関する説明（例：法令に基づく場合を除き、第三者への提供および委託は行いません。）"
    );

    // 委託先の例
    const examples = withPlaceholder(
      (data.thirdParties?.entrustExamples || []).join("、"),
      "委託先の例（例：サーバー会社、決済代行業者など）"
    );

    sectionThird = `
  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">個人情報の第三者提供および委託</h3>
    <p>第三者提供・委託に関する説明：<br>${detail}</p>
    <p>委託先の例：<br>${examples}</p>
  </section>`;
  }



  // ============================================================
  // ④ アクセス解析
  // ============================================================
  let sectionAnalytics = "";
  if (data.analytics?.noAnalytics !== true) {
    const tools = (data.analytics?.tools || []).map((t) => {
      const name = withPlaceholder(t.name, "ツール名未入力");
      const provider = t.provider ? `（提供者：${escapeHTML(t.provider)}）` : "";
      const purpose = withPlaceholder(t.purpose, "目的未入力");
      const optout = t.optoutUrl
        ? `<br>オプトアウトURL：<a href="${escapeHTML(t.optoutUrl)}" target="_blank">${escapeHTML(
          t.optoutUrl
        )}</a>`
        : "";
      return `<li>${name}${provider}：${purpose}${optout}</li>`;
    });

    const content = tools.length
      ? `<ul>${tools.join("")}</ul>`
      : `<p>${withPlaceholder("", "解析ツール未入力")}</p>`;

    sectionAnalytics = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">アクセス解析ツールの使用</h3>
      <p>当サイトでは、以下のアクセス解析ツールを利用しています。</p>
      ${content}
    </section>`;
  }

  // ============================================================
  // ⑤ Cookie
  // ============================================================
  let sectionCookies = "";
  if (data.cookies?.noCookies !== true) {
    const purposes = withPlaceholder(
      (data.cookies?.purposes || []).join("、"),
      "Cookie使用目的未入力（例：利便性向上、アクセス解析、広告配信など）"
    );
    const disable = withPlaceholder(
      data.cookies?.disableMethod,
      "無効化方法未入力（例：ブラウザ設定からCookieを無効化できます）"
    );

    sectionCookies = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">Cookie（クッキー）の使用について</h3>
      <p>
        当サイトでは、${purposes}の目的でCookieを使用しています。<br>
        ${disable}
      </p>
    </section>`;
  }

  // ============================================================
  // ⑥ 管理体制（該当なしチェックなし）
  // ============================================================
  const securityText = withPlaceholder(
    (data.security?.measures || []).join("、"),
    "セキュリティ対策未入力（例：SSL/TLS通信暗号化、アクセス制御、定期的な見直し）"
  );
  const sectionSecurity = `
  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">個人情報の管理体制</h3>
    <p>${securityText}</p>
  </section>`;

  // ============================================================
  // ⑦ 開示・訂正・削除等の請求について
  // ============================================================
  let contactOutput = "";
  if (userRights.contact || userRights.phone) {
    contactOutput = `
      ${userRights.contact ? `メール：<a href="mailto:${escapeHTML(userRights.contact)}">${escapeHTML(userRights.contact)}</a><br>` : ""}
      ${userRights.phone ? `電話：${escapeHTML(userRights.phone)}<br>` : ""}
    `;
  } else {
    contactOutput = withPlaceholder("", "連絡先未設定（メールまたは電話番号のいずれかを入力）");
  }

  // ============================================================
  // HTML全体組み立て
  // ============================================================
  return `
<article class="uk-article policy-content uk-margin-large-top">

  <h2 class="uk-heading-bullet">プライバシーポリシー</h2>
  <p>
    本プライバシーポリシーは、${operator}（以下「当社」といいます。）が運営する
    「${site}」（以下「本サイト」といいます。）における個人情報の取扱いについて定めるものです。
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
