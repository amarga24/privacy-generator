// ============================================================
// api/policy-template.js
// ------------------------------------------------------------
// 概要: 入力データ（フォーム内容）を受け取り、
//       プライバシーポリシーのHTML本文を作るファイルです。
// 特徴: 未入力の項目があった場合、自動的に
//       「（※要修正※）」という印を付けて出力します。
//       さらに、不正なタグなどを無効化して安全に表示します。
// 注意: 入力データは保存されず、生成後に破棄されます。
// ============================================================


/**
 * ------------------------------------------------------------
 * cleanInput()
 * ------------------------------------------------------------
 * 入力内容を安全に整える関数です。
 * - 何も入力されていない場合は「（※要修正※）」を自動で付けます。
 * - < や > などの記号を無害化して、HTMLタグとして動かないようにします。
 *
 * こうすることで、ユーザーが入力した内容をそのまま表示しても
 * サイトが壊れたり、悪意あるコードが動いたりするのを防ぎます。
 *
 * @param {string} value - 入力内容
 * @param {string} placeholder - 未入力時に表示する補足文
 * @returns {string} 整えた文字列
 */
function cleanInput(value, placeholder) {
  if (!value || String(value).trim() === "") {
    return `（※要修正※）${placeholder}`;
  }
  // 特殊記号を安全に変換する
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


/**
 * ------------------------------------------------------------
 * buildPolicyHTML()
 * ------------------------------------------------------------
 * フォームで入力された情報をもとに、
 * プライバシーポリシーの本文HTMLを作る関数です。
 * 未入力の項目には「（※要修正※）」を自動で追加します。
 *
 * @param {Object} data - フロント側から送られる入力データ
 * @returns {string} 完成したHTML本文
 */
export function buildPolicyHTML(data) {
  // --------------------------------------------
  // 入力データを取り出す
  // --------------------------------------------
  const {
    siteName,
    operatorName,
    contactEmail,
    establishedDate,
    purpose,
    analyticsTool,
    delegation,
  } = data || {};

  // --------------------------------------------
  // 各項目を安全に整える
  // --------------------------------------------
  const site = cleanInput(siteName, "サイト名未設定");
  const operator = cleanInput(operatorName, "運営者名未設定");
  const email = cleanInput(contactEmail, "メールアドレス未設定");
  const date = cleanInput(establishedDate, "制定日未設定");
  const tool = cleanInput(analyticsTool, "アクセス解析ツール未記入");
  const purposeText = cleanInput(purpose, "利用目的未記入");
  const delegate = cleanInput(delegation, "委託先情報未記入");

  // --------------------------------------------
  // プライバシーポリシー本文を組み立てる
  // --------------------------------------------
  return `
<article class="uk-article policy-content uk-margin-large-top">

  <h2 class="uk-heading-line"><span>プライバシーポリシー</span></h2>
  <p>
    本プライバシーポリシーは、${operator}（以下「当社」といいます。）が運営する
    「${site}」（以下「本サイト」といいます。）における個人情報の取扱いについて定めるものです。
  </p>

  <section class="uk-section-xsmall">
    <h3 class="uk-h3">個人情報の取得方法</h3>
    <p>
      当サイトでは、お問い合わせフォームなどを通じて、利用者から個人情報を取得する場合があります。
      また、自動的に取得される情報として、アクセスログやCookie情報を取得します。
    </p>
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-h3">個人情報の利用目的</h3>
    <p>
      ${purposeText}
    </p>
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-h3">アクセス解析ツールの使用</h3>
    <p>
      当サイトでは、${tool} を利用しています。
      これにより収集されるデータは匿名であり、個人を特定するものではありません。
    </p>
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-h3">個人情報の第三者提供および委託</h3>
    <p>
      当サイトでは、法令に基づく場合を除き、第三者への個人情報の提供は行いません。
      ${delegate}
    </p>
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-h3">Cookie（クッキー）の使用について</h3>
    <p>
      当サイトでは、利便性の向上やアクセス解析の目的でCookieを使用しています。
      Cookieの無効化は、各ブラウザの設定画面から行うことができます。
    </p>
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-h3">個人情報の管理体制</h3>
    <p>
      当サイトでは、SSL/TLS通信による暗号化、アクセス権限の制限、
      および定期的な見直しなどの措置を講じています。
    </p>
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-h3">開示・訂正・削除等の請求について</h3>
    <p>
      利用者ご本人からの開示・訂正・削除等のご請求には、適切かつ迅速に対応いたします。<br>
      ご連絡は以下のメールアドレスまでお願いいたします：<br>
      <a href="mailto:${email}" class="uk-link-text">${email}</a>
    </p>
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-h3">法令・規範の遵守と見直し</h3>
    <p>
      当サイトは、適用される日本の法令およびその他の規範を遵守し、
      継続的に見直しと改善を行います。
    </p>
  </section>

  <p class="policy-date uk-text-meta uk-margin-top">
    本ポリシーは <strong class="uk-text-danger">${date}</strong> より施行します。
  </p>

  <p class="uk-text-right uk-margin-remove-bottom">以上</p>
</article>
`;
}
