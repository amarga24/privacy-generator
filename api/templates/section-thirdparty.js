// ===================================================
// section-thirdparty.js：第三者提供および委託
// 役割：個人情報の第三者提供有無と委託先の扱いを明記。
// ===================================================
export default function (data) {
  const t = data.thirdParties || {};
  const entrusts = (t.entrustExamples || []).join('、');
  return `
<section id="thirdparty">
  <h2>個人情報の第三者提供および委託</h2>
  <p>${t.detail || '法令に基づく場合を除き、第三者へ提供しません。'}</p>
  ${t.entrustsProcessing ? `<p>業務遂行にあたり、${entrusts || '必要な業務委託先'}へ個人情報の取扱いを委託する場合があります。</p>` : ''}
</section>`;
}
