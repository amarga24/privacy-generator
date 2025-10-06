// ===================================================
// section-legal.js：法的情報
// 役割：ポリシーの発効日および準拠法を記載。
// ===================================================
export default function (data) {
  const l = data.legal || {};
  return `
<section id="legal">
  <h2>法的情報</h2>
  <ul>
    <li>発効日：${l.effectiveDate || '（日付）'}</li>
    <li>準拠法：${l.governingLaw || '日本法'}</li>
  </ul>
</section>`;
}
