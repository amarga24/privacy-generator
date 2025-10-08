// ============================================================
// api/policy-template.js
// ------------------------------------------------------------
// 概要: 入力データ（フォーム内容）を受け取り、
//       プライバシーポリシーHTML本文を生成する。
// 特徴: 未入力の項目に「（※要修正※）」を自動表示し、
//       UIkitの uk-alert-danger で赤背景警告を出す。
//       各セクションで「該当なし」チェック時は出力を省略。
// 注意: 入力データは保存せず、レスポンス生成後に破棄。
// ============================================================

function cleanInput(value, placeholder) {
  if (!value || String(value).trim() === "") {
    return `<div class="uk-alert-danger" uk-alert>（※要修正※）${placeholder}</div>`;
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * ------------------------------------------------------------
 * buildPolicyHTML()
 * ------------------------------------------------------------
 * フォーム入力データをもとに、UIkit準拠のプライバシーポリシーHTMLを生成。
 * - uk-heading-bullet：見出しデザイン
 * - uk-alert-danger：未入力警告
 * - 「該当なし」チェック時はセクション非出力。
 * - メールまたは電話番号が空の場合も警告を出す。
 * ------------------------------------------------------------
 */
export function buildPolicyHTML(data) {
  const base = data.base || {};
  const userRights = data.userRights || {};

  const site = cleanInput(base.siteName, "サイト名未設定");
  const operator = cleanInput(base.operatorName, "運営者名未設定");
  const email = cleanInput(base.contactEmail, "メールアドレス未設定");
  const date = cleanInput(data.legal?.effectiveDate, "施行日未設定");

  // HTMLセクション変数
  let sectionCollection = "";
  let sectionPurposes = "";
  let sectionThird = "";
  let sectionAnalytics = "";
  let sectionCookies = "";

  // ------------------------------------------------------------
  // 個人情報の取得方法
  // ------------------------------------------------------------
  if (!data.collection?.noCollection) {
    // 空欄時に赤字（uk-text-danger）＋例文を先頭に表示
    const withPlaceholder = (val, placeholder) => {
      if (val && String(val).trim() !== "") return String(val).trim();
      return `<span class="uk-text-danger">（※要修正※）${placeholder}</span>`;
    };

    // 各項目の整形
    const methods = withPlaceholder(
      (data.collection.methods || []).join("、"),
      "ユーザー入力による取得（例：お問い合わせフォーム、会員登録など）"
    );

    const auto = withPlaceholder(
      (data.collection.autoCollection || []).join("、"),
      "自動取得される情報（例：アクセスログ、Cookie、IPアドレスなど）"
    );

    const detail = withPlaceholder(
      data.collection.detail,
      "補足説明（例：これらの情報はサービス提供や不正防止のために利用）"
    );

    // 出力（見出しはそのまま）
    sectionCollection = `
  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">個人情報の取得方法</h3>
    <p><strong>ユーザー入力による取得：</strong><br>${methods}</p>
    <p><strong>自動取得される情報：</strong><br>${auto}</p>
    <p><strong>補足説明：</strong><br>${detail}</p>
  </section>`;
  }

  // ------------------------------------------------------------
  // 利用目的
  // ------------------------------------------------------------
  if (!data.purposesFlag) {
    const purposes = (data.purposes || []).map((p) => {
      const cat = p.category || "";
      const tgt = p.target || "";
      const desc = p.description || "";
      return `<li>${cat}${tgt ? `（${tgt}）` : ""}：${desc}</li>`;
    });

    const content = purposes.length
      ? `<ul>${purposes.join("")}</ul>`
      : `<div class="uk-alert-danger" uk-alert>（※要修正※）利用目的未入力</div>`;

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
  if (!data.thirdParties?.noThirdparty) {
    const detail = cleanInput(data.thirdParties.detail, "委託・提供に関する説明未入力");
    const examples = (data.thirdParties.entrustExamples || []).join("、");

    sectionThird = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の第三者提供および委託</h3>
      <p>
        当サイトでは、法令に基づく場合を除き、第三者への個人情報の提供は行いません。<br>
        ${detail}
        ${examples ? `<br>主な委託先の例：${examples}` : ""}
      </p>
    </section>`;
  }

  // ------------------------------------------------------------
  // アクセス解析
  // ------------------------------------------------------------
  if (!data.analytics?.noAnalytics) {
    const tools = (data.analytics.tools || []).map((t) => {
      const name = cleanInput(t.name, "ツール名未入力");
      const provider = t.provider ? `（提供者：${t.provider}）` : "";
      const purpose = t.purpose || "目的未記入";
      const optout = t.optoutUrl ? `<br>オプトアウトURL：<a href="${t.optoutUrl}" target="_blank">${t.optoutUrl}</a>` : "";
      return `<li>${name}${provider}：${purpose}${optout}</li>`;
    });

    const content = tools.length
      ? `<ul>${tools.join("")}</ul>`
      : `<div class="uk-alert-danger" uk-alert>（※要修正※）解析ツール未入力</div>`;

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
  if (!data.cookies?.noCookies) {
    const purposes = (data.cookies.purposes || []).join("、") || "（※要修正※）Cookie使用目的未入力";
    const disable = cleanInput(data.cookies.disableMethod, "無効化方法未入力");

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
  // 開示請求・連絡先
  // ------------------------------------------------------------
  let contactOutput = "";
  if (userRights.contact || userRights.phone) {
    contactOutput = `
      ${userRights.contact ? `メール：<a href="mailto:${userRights.contact}" class="uk-link-text">${userRights.contact}</a><br>` : ""}
      ${userRights.phone ? `電話：${userRights.phone}<br>` : ""}
    `;
  } else {
    contactOutput = `<div class="uk-alert-danger" uk-alert>（※要修正※）連絡先未設定（メールまたは電話番号のいずれかを入力してください）</div>`;
  }

  // ------------------------------------------------------------
  // HTML組み立て
  // ------------------------------------------------------------
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

  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">個人情報の管理体制</h3>
    <p>
      当サイトでは、SSL/TLS通信による暗号化、アクセス権限の制限、
      および定期的な見直しなどの措置を講じています。
    </p>
  </section>

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
</article>
`;
}
