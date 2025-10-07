// ================================================
// sections.js：プライバシーポリシー構成ルール
// 役割：テンプレート統合時に使用するセクション一覧を定義
// ================================================

// export const SECTION_RULES
// 各オブジェクトは { key, file, condition } の形式
// condition はオプションで、該当データがある場合のみ出力

export const SECTION_RULES = [
  // 1. 基本情報（サイト名・運営者など）
  { key: "base", file: "section-base.js" },

  // 2. 個人情報の取得方法
  { key: "collection", file: "section-collection.js" },

  // 3. 利用目的
  { key: "purposes", file: "section-purposes.js" },

  // 4. 第三者提供・委託先
  { key: "thirdParties", file: "section-thirdparty.js" },

  // 5. Cookie利用
  {
    key: "cookies",
    file: "section-cookies.js",
    condition: (d) => d.cookies?.useCookies === true,
  },

  // 6. アクセス解析ツール
  {
    key: "analytics",
    file: "section-analytics.js",
    condition: (d) => d.analytics?.useAnalytics === true,
  },

  // 7. 安全管理措置
  { key: "security", file: "section-security.js" },

  // 8. 利用者の権利（開示・訂正・削除など）
  { key: "userRights", file: "section-userrights.js" },

  // 9. 法的事項（施行日・準拠法など）
  { key: "legal", file: "section-legal.js" },
];
