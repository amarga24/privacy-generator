// ===========================================================
// sections.js：テンプレート構成ルール定義
// 役割：プライバシーポリシーのセクション構成と条件分岐を定義。
// 各セクションは templates ディレクトリ内のファイルと対応する。
// ===========================================================

export const SECTION_RULES = [
  // 基本情報セクション
  { key: 'base', file: 'section-base.js' },

  // 個人情報の取得方法
  { key: 'collection', file: 'section-collection.js' },

  // 利用目的
  { key: 'purposes', file: 'section-purposes.js' },

  // 第三者提供・委託
  { key: 'thirdParties', file: 'section-thirdparty.js' },

  // Cookie利用（利用時のみ出力）
  { key: 'cookies', file: 'section-cookies.js', condition: d => d.cookies?.useCookies },

  // アクセス解析（利用時のみ出力）
  { key: 'analytics', file: 'section-analytics.js', condition: d => d.analytics?.useAnalytics },

  // セキュリティ対策
  { key: 'security', file: 'section-security.js' },

  // 利用者の権利（開示・訂正・削除）
  { key: 'userRights', file: 'section-userrights.js' },

  // 法的情報
  { key: 'legal', file: 'section-legal.js' }
];
