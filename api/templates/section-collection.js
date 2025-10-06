// ===================================================
// section-collection.js：個人情報の取得方法
// 役割：取得経路（手動・自動）とその詳細を説明。
// ===================================================
export default function (data) {
  const c = data.collection || {};
  const manual = (c.methods || []).join('、');
  const auto = (c.autoCollection || []).join('、');
  return `
<section id="collection">
  <h2>個人情報の取得方法</h2>
  <p>当サイトでは、${manual || 'お問い合わせフォームなど'}を通じて利用者から直接情報を取得するほか、${auto || 'アクセス解析等'}を通じて自動的に情報を取得する場合があります。</p>
  ${c.detail ? `<p>${c.detail}</p>` : ''}
</section>`;
}
