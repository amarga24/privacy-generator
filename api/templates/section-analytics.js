// ===================================================
// section-analytics.js：アクセス解析ツールの利用
// 役割：利用中の解析ツールと提供者・目的・オプトアウト方法を記載。
// ===================================================
export default function (data) {
  const tools = (data.analytics?.tools || []).map(t => `
    <li>${t.name || '（ツール名）'}（提供者：${t.provider || '（提供者）'}）－ ${t.purpose || '（目的）'}
      ${t.optoutUrl ? `<br>オプトアウトURL：<a href="${t.optoutUrl}" target="_blank">${t.optoutUrl}</a>` : ''}
    </li>
  `).join('');
  return `
<section id="analytics">
  <h2>アクセス解析ツールの利用</h2>
  <p>当サイトでは、サイトの利用状況を把握するため、以下のアクセス解析ツールを使用しています。</p>
  <ul>${tools}</ul>
</section>`;
}
