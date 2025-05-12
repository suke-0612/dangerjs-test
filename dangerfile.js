import { danger, warn, fail, markdown } from 'danger';

/**
 * mainブランチへのマージを検出し、特定の例外ブランチを除いて警告を表示する
 */
function warnOnMainMerge(){
  const targetBranch = danger.github.pr.base.ref;
  const sourceBranch = danger.github.pr.head.ref;
  
  // mainブランチへのマージかどうかをチェック
  if (targetBranch !== 'main') {
    return;
  }
  
  // 除外パターンを定義
  const excludePatterns = [
    /^feature\/KP2-[ABZ]\/.+$/,
    /^front-Z\/.+$/,
    /^back-Z\/.+$/,
    /^api-Z\/.+$/,
    /^hotfix-front\/.+$/,
    /^hotfix-back\/.+$/,
    /^hotfix-api\/.+$/
  ];
  
  // ソースブランチが除外パターンのいずれかに一致するかをチェック
  const isExcluded = excludePatterns.some(pattern => pattern.test(sourceBranch));
  
  if (!isExcluded) {
    warn(`⚠️ このPRは **main** ブランチへのマージです！`);
    markdown(`
### ⚠️ ブランチの向き先確認！
Pull requestの向き先が\`main\`になっています
向き先が正しいか確認してください！
    `);
  }
}

/**
 * ブランチ名が命名規則に合っているかチェックする
 */
function checkBranchNamingConvention(){
  const branchName = danger.github.pr.head.ref;
  
  // 命名規則パターンを定義
  const namingConventions = [
    /^main$/,
    /^feature\/KP2-[AB]\/sprint\d+$/,
    /^feature\/KP2-Z\/.*$/,
    /^front-[ABZ]\/KP2-\d+.*$/,
    /^back-[ABZ]\/KP2-\d+.*$/,
    /^api-[ABZ]\/KP2-\d+.*$/,
    /^hotfix-front\/KP2-\d+.*$/,
    /^hotfix-back\/KP2-\d+.*$/,
    /^hotfix-api\/KP2-\d+.*$/,
    /^preRelease$/,
    /^release\d+\.\d+\.\d+$/
  ];
  
  // ブランチ名が命名規則に一致するかをチェック
  const isValidBranchName = namingConventions.some(pattern => pattern.test(branchName));
  
  if (!isValidBranchName) {
    fail(`
### 🚫 ブランチ名が命名規則に準拠していません！
現在のブランチ名: \`${branchName}\`

以下のいずれかの形式で命名してください:
- \`main\`
- \`feature/KP2-[A/B]/sprint[番号]\` (例: \`feature/KP2-A/sprint1\`)
- \`feature/KP2-Z/[任意の文字列]\`
- \`front-[A/B/Z]/KP2-[番号][任意の文字列]\` (例: \`front-A/KP2-123-fix\`)
- \`back-[A/B/Z]/KP2-[番号][任意の文字列]\`
- \`api-[A/B/Z]/KP2-[番号][任意の文字列]\`
- \`hotfix-front/KP2-[番号][任意の文字列]\`
- \`hotfix-back/KP2-[番号][任意の文字列]\`
- \`hotfix-api/KP2-[番号][任意の文字列]\`
- \`preRelease\`
- \`release[メジャー].[マイナー].[パッチ]\` (例: \`release1.2.3\`)
    `);
  } else {
    markdown(`
### ✅ ブランチ命名チェック
ブランチ名 \`${branchName}\` は命名規則に準拠しています。
    `);
  }
}

// ルールを実行
warnOnMainMerge();
checkBranchNamingConvention();