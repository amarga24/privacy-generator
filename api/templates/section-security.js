// ===================================================
// section-security.js：セキュリティ管理
// 役割：個人情報の保護・管理体制に関する対策を列挙。
// ===================================================
export default function (data) {
  const s = data.security || {};
  const list = (s.measures || []).map(v => `<li>${v}</li>`).join('');
  return `
<section id="security">
  <h2>個人情報の管理</h2>
  <p>当サイトは、取得した個人情報を適切に管理し、漏洩・改ざん・不正アクセス等の防止に努めます。</p>
  ${list ? `<ul>${list}</ul>` : ''}
</section>`;
}
