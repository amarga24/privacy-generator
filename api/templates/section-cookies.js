// ===================================================
// section-cookies.js：Cookieの利用
// 役割：Cookieの使用目的と無効化方法を説明。
// ===================================================
export default function (data) {
  const c = data.cookies || {};
  const purposes = (c.purposes || []).join('、');
  return `
<section id="cookies">
  <h2>Cookieの利用</h2>
  <p>当サイトでは、${purposes || '利便性向上'}を目的としてCookieを使用しています。Cookieの情報には個人を特定できるものは含まれません。</p>
  <p>Cookieの利用を希望しない場合は、${c.disableMethod || 'ブラウザ設定により無効化'}してください。</p>
</section>`;
}
