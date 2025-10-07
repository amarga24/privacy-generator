// ============================================================
// api/policy-template.js
// ------------------------------------------------------------
// 概要: 入力データ（フォーム内容）を受け取り、
//       プライバシーポリシーHTML本文を生成する。
// 特徴: 未入力の項目に「（※要修正※）」を自動表示し、
//       UIkitの uk-alert-danger で赤背景警告を出す。
//       また、各セクションで「該当なし」チェック時は出力を省略する。
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
  const date = cleanInput(base.establishedDate, "制定日未設定");

  // HTMLセクション変数
  let sectionCollection = "";
  let sectionPurposes = "";
  let sectionThird = "";
  let sectionAnalytics = "";
  let sectionCookies = "";

  // ------------------------------------------------------------
  // 個人情報の取得方法（該当なしでない場合のみ出力）
  // ------------------------------------------------------------
  if (!data.collection?.noCollection) {
    sectionCollection = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の取得方法</h3>
      <p>
        当サイトでは、お問い合わせフォームなどを通じて、利用者から個人情報を取得する場合があります。
        また、自動的に取得される情報として、アクセスログやCookie情報を取得します。
      </p>
    </section>`;
  }

  // ------------------------------------------------------------
  // 利用目的（該当なしでない場合のみ出力）
  // ------------------------------------------------------------
  if (!data.purposesFlag) {
    const purposeText = cleanInput(data.purpose, "利用目的未記入（例：お問い合わせ対応・サービス改善のため）");
    sectionPurposes = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の利用目的</h3>
      <p>${purposeText}</p>
    </section>`;
  }

  // ------------------------------------------------------------
  // 第三者提供・委託（該当なしでない場合のみ出力）
  // ------------------------------------------------------------
  if (!data.thirdParties?.noThirdparty) {
    const delegate = cleanInput(data.delegation, "委託先情報未記入（例：サーバー管理会社など）");
    sectionThird = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の第三者提供および委託</h3>
      <p>
        当サイトでは、法令に基づく場合を除き、第三者への個人情報の提供は行いません。
        ${delegate}
      </p>
    </section>`;
  }

  // ------------------------------------------------------------
  // アクセス解析（該当なしでない場合のみ出力）
  // ------------------------------------------------------------
  if (!data.analytics?.noAnalytics) {
    const tool = cleanInput(data.analyticsTool, "アクセス解析ツール未記入（例：Google Analytics 4）");
    sectionAnalytics = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">アクセス解析ツールの使用</h3>
      <p>
        当サイトでは、${tool} を利用しています。
        これにより収集されるデータは匿名であり、個人を特定するものではありません。
      </p>
    </section>`;
  }

  // ------------------------------------------------------------
  // Cookie（該当なしでない場合のみ出力）
  // ------------------------------------------------------------
  if (!data.cookies?.noCookies) {
    sectionCookies = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">Cookie（クッキー）の使用について</h3>
      <p>
        当サイトでは、利便性の向上やアクセス解析の目的でCookieを使用しています。
        Cookieの無効化は、各ブラウザの設定画面から行うことができます。
      </p>
    </section>`;
  }

  // ------------------------------------------------------------
  // 開示請求の連絡先
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
  ${sectionAnalytics}
  ${sectionThird}
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
