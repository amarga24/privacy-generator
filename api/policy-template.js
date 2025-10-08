// ============================================================
// api/policy-template.js (最終改善版)
// ------------------------------------------------------------
// 改善点:
// 1. 「該当なし」チェック時は適切な標準文言を自動出力
// 2. 赤字「※要修正※」を最小限に抑制
// 3. 初期状態でも自然なプライバシーポリシーが生成される
// ============================================================

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildPolicyHTML(data) {
  const base = data.base || {};
  const userRights = data.userRights || {};

  const site = base.siteName || "（サイト名未設定）";
  const operator = base.operatorName || "（運営者名未設定）";
  const representative = base.representative ? escapeHTML(base.representative) : "";
  const address = base.address ? escapeHTML(base.address) : "";
  const email = userRights.contact || "（メールアドレス未設定）";
  const date = data.legal?.effectiveDate || "（発効日未設定）";

  // ============================================================
  // 個人情報の取得方法
  // ============================================================
  let sectionCollection = "";
  if (data.collection?.noCollection === true) {
    // 「該当なし」の場合: 標準文言を出力
    sectionCollection = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の取得について</h3>
      <p>当サイトでは、お問い合わせフォームや会員登録フォーム等による個人情報の取得は行っておりません。</p>
    </section>`;
  } else if ((data.collection?.methods || []).length > 0 || (data.collection?.autoCollection || []).length > 0 || data.collection?.detail) {
    // 入力がある場合のみ詳細を出力
    const methods = (data.collection?.methods || []).join("、");
    const auto = (data.collection?.autoCollection || []).join("、");
    const detail = data.collection?.detail || "";

    const methodsText = methods || "（未入力）";
    const autoText = auto || "（未入力）";

    sectionCollection = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の取得方法</h3>
      ${methods ? `<p><strong>ユーザー入力による取得：</strong><br>${escapeHTML(methods)}</p>` : ""}
      ${auto ? `<p><strong>自動取得される情報：</strong><br>${escapeHTML(auto)}</p>` : ""}
      ${detail ? `<p><strong>補足説明：</strong><br>${escapeHTML(detail)}</p>` : ""}
    </section>`;
  } else {
    // 何も入力がなく、チェックもOFFの場合は標準文言
    sectionCollection = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の取得について</h3>
      <p>当サイトでは、お問い合わせフォームや会員登録フォーム等による個人情報の取得は行っておりません。</p>
    </section>`;
  }

  // ============================================================
  // 個人情報の利用目的
  // ============================================================
  let sectionPurposes = "";
  if (data.purposesFlag === true || data.collection?.noCollection === true) {
    // 「該当なし」の場合: 標準文言を出力
    sectionPurposes = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の利用目的</h3>
      <p>当サイトでは、個人情報を取得していないため、利用目的はありません。</p>
    </section>`;
  } else if ((data.purposes || []).length > 0) {
    // 入力がある場合のみ詳細を出力
    const purposes = data.purposes.map((p) => {
      const cat = p.category || "お問い合わせ対応";
      const tgt = p.target ? `（${escapeHTML(p.target)}）` : "";
      const desc = p.description || "お客様からのお問い合わせに対応するため";
      return `<li>${escapeHTML(cat)}${tgt}：${escapeHTML(desc)}</li>`;
    });

    sectionPurposes = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の利用目的</h3>
      <p>当サイトが取得した個人情報は、以下の目的のために利用いたします。</p>
      <ul>${purposes.join("")}</ul>
    </section>`;
  } else {
    // 空配列の場合も標準文言
    sectionPurposes = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の利用目的</h3>
      <p>当サイトでは、個人情報を取得していないため、利用目的はありません。</p>
    </section>`;
  }

  // ============================================================
  // 第三者提供・委託
  // ============================================================
  let sectionThird = "";
  if (data.thirdParties?.noThirdparty === true) {
    // 「該当なし」の場合: 標準文言を出力
    sectionThird = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の第三者提供について</h3>
      <p>当サイトでは、法令に基づく場合を除き、個人情報の第三者への提供および委託は行いません。</p>
    </section>`;
  } else if (data.thirdParties?.detail || (data.thirdParties?.entrustExamples || []).length > 0) {
    // 入力がある場合のみ詳細を出力
    const detail = data.thirdParties?.detail || "";
    const examples = (data.thirdParties?.entrustExamples || []).join("、");

    const detailText = detail || "法令に基づく場合を除き、第三者への提供および委託は行いません。";
    
    const examplesText = examples
      ? `<p><strong>委託先の例：</strong>${escapeHTML(examples)}</p>`
      : "";

    sectionThird = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の第三者提供および委託</h3>
      <p>${escapeHTML(detailText)}</p>
      ${examplesText}
    </section>`;
  } else {
    // 何も入力がない場合も標準文言
    sectionThird = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">個人情報の第三者提供について</h3>
      <p>当サイトでは、法令に基づく場合を除き、個人情報の第三者への提供および委託は行いません。</p>
    </section>`;
  }

  // ============================================================
  // アクセス解析
  // ============================================================
  let sectionAnalytics = "";
  if (data.analytics?.noAnalytics !== true && (data.analytics?.tools || []).length > 0) {
    const tools = data.analytics.tools.map((t) => {
      const name = t.name || "Google Analytics";
      const provider = t.provider ? `（提供者：${escapeHTML(t.provider)}）` : "";
      const purpose = t.purpose || "サイト改善のためのアクセス状況分析";
      const optout = t.optoutUrl
        ? `<br>オプトアウトURL：<a href="${escapeHTML(t.optoutUrl)}" target="_blank" rel="noopener">${escapeHTML(t.optoutUrl)}</a>`
        : "";
      return `<li>${escapeHTML(name)}${provider}：${escapeHTML(purpose)}${optout}</li>`;
    });

    sectionAnalytics = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">アクセス解析ツールの使用</h3>
      <p>当サイトでは、サービス向上のため以下のアクセス解析ツールを利用しています。</p>
      <ul>${tools.join("")}</ul>
    </section>`;
  }

  // ============================================================
  // Cookie
  // ============================================================
  let sectionCookies = "";
  if (data.cookies?.noCookies === true) {
    // 「該当なし」の場合: セクションを出力しない（完全にスキップ）
    sectionCookies = "";
  } else if ((data.cookies?.purposes || []).length > 0 || data.cookies?.disableMethod) {
    // 入力がある場合のみ出力
    const purposes = (data.cookies?.purposes || []).join("、");
    const disable = data.cookies?.disableMethod || "";

    const purposesText = purposes || "利便性向上、アクセス解析";
    const disableText = disable || "ブラウザ設定からCookieを無効化できますが、一部機能が利用できなくなる場合があります。";

    sectionCookies = `
    <section class="uk-section-xsmall">
      <h3 class="uk-heading-bullet">Cookie（クッキー）の使用について</h3>
      <p>当サイトでは、${escapeHTML(purposesText)}の目的でCookieを使用しています。</p>
      <p>${escapeHTML(disableText)}</p>
    </section>`;
  }

  // ============================================================
  // 管理体制（必須セクション）
  // ============================================================
  const securityMeasures = (data.security?.measures || []).join("、");
  const securityText = securityMeasures || "適切なアクセス制御、定期的な見直し";

  const sectionSecurity = `
  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">個人情報の安全管理</h3>
    <p>当サイトでは、個人情報の漏洩、滅失、毀損の防止その他の安全管理のため、以下の対策を講じています。</p>
    <p>${escapeHTML(securityText)}</p>
  </section>`;

  // ============================================================
  // 開示・訂正・削除等の請求（必須セクション）
  // ============================================================
  let contactOutput = "";
  if (userRights.contact || userRights.phone) {
    contactOutput = `
      ${userRights.contact ? `<strong>メール：</strong><a href="mailto:${escapeHTML(userRights.contact)}">${escapeHTML(userRights.contact)}</a><br>` : ""}
      ${userRights.phone ? `<strong>電話：</strong>${escapeHTML(userRights.phone)}<br>` : ""}
    `;
  } else {
    contactOutput = `<strong>メール：</strong>（連絡先を設定してください）`;
  }

  const procedureText = userRights.procedure
    ? escapeHTML(userRights.procedure)
    : "本人確認の上、適切かつ迅速に対応いたします。";

  // ============================================================
  // HTML全体組み立て
  // ============================================================
  return `
<article class="uk-article policy-content">

  <h2 class="uk-heading-bullet">プライバシーポリシー</h2>
  <p>
    ${escapeHTML(operator)}
    ${representative ? `（代表者：${representative}）` : ""}
    が運営する「${escapeHTML(site)}」（以下「本サイト」といいます。）における個人情報の取扱いについて、以下のとおり定めます。
    ${address ? `<br><strong>所在地：</strong>${address}` : ""}
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
      保有個人データの開示、訂正、利用停止、消去等のご請求については、以下の窓口で受け付けております。
    </p>
    <p>${contactOutput}</p>
    <p>${procedureText}</p>
  </section>

  <section class="uk-section-xsmall">
    <h3 class="uk-heading-bullet">法令・規範の遵守</h3>
    <p>
      当サイトは、個人情報保護法その他の関係法令および個人情報保護委員会のガイドラインを遵守し、
      本ポリシーの内容について適宜見直しを行います。
    </p>
  </section>

  <p class="policy-date uk-text-meta uk-margin-top">
    <strong>制定日：</strong>${escapeHTML(date)}
  </p>

  <p class="uk-text-right uk-text-small uk-text-muted">以上</p>
</article>`;
}