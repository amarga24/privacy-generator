// ===================================================
// section-purposes.js：利用目的
// 役割：取得した個人情報の利用目的を一覧形式で表示。
// ===================================================
export default function (data) {
  const list = (data.purposes || []).map(p =>
    `<li>${p.category || ''}（対象：${p.target || ''}）－ ${p.description || ''}</li>`
  ).join('');
  return `
<section id="purposes">
  <h2>個人情報の利用目的</h2>
  <p>当サイトが取得した個人情報は、以下の目的の範囲内で利用します。</p>
  <ul>${list}</ul>
</section>`;
}
