import { danger, warn, fail, markdown } from 'danger';
import didYouMean from 'didyoumean';

/**
 * mainブランチへのマージを検出し、特定の例外ブランチを除いて警告を表示する
 */
function warnOnMainMerge(): void {
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
 * ブランチ名が命名規則に合っているかチェックし、合わない場合はサジェストする
 */
function checkBranchNamingConvention(): void {
  const branchName = danger.github.pr.head.ref;
  
  // 命名規則パターンとその説明
  const namingConventions = [
    { pattern: /^main$/, example: 'main' },
    { pattern: /^feature\/KP2-[AB]\/sprint\d+$/, example: 'feature/KP2-A/sprint1' },
    { pattern: /^feature\/KP2-Z\/.*$/, example: 'feature/KP2-Z/任意の文字列' },
    { pattern: /^front-[ABZ]\/KP2-\d+.*$/, example: 'front-A/KP2-123-fix' },
    { pattern: /^back-[ABZ]\/KP2-\d+.*$/, example: 'back-B/KP2-456-feature' },
    { pattern: /^api-[ABZ]\/KP2-\d+.*$/, example: 'api-Z/KP2-789-update' },
    { pattern: /^hotfix-front\/KP2-\d+.*$/, example: 'hotfix-front/KP2-123-bugfix' },
    { pattern: /^hotfix-back\/KP2-\d+.*$/, example: 'hotfix-back/KP2-456-urgent' },
    { pattern: /^hotfix-api\/KP2-\d+.*$/, example: 'hotfix-api/KP2-789-critical' },
    { pattern: /^preRelease$/, example: 'preRelease' },
    { pattern: /^release\d+\.\d+\.\d+$/, example: 'release1.2.3' }
  ];
  
  // ブランチ名のプレフィックスと一般的なパターン
  const branchPrefixes = [
    'feature/KP2-A/sprint',
    'feature/KP2-B/sprint',
    'feature/KP2-Z/',
    'front-A/KP2-',
    'front-B/KP2-',
    'front-Z/KP2-',
    'back-A/KP2-',
    'back-B/KP2-',
    'back-Z/KP2-',
    'api-A/KP2-',
    'api-B/KP2-',
    'api-Z/KP2-',
    'hotfix-front/KP2-',
    'hotfix-back/KP2-',
    'hotfix-api/KP2-',
    'preRelease',
    'release'
  ];
  
  // ブランチ名の一般的なパターン
  const commonBranchPatterns = [
    'main',
    'feature/KP2-A/sprint1',
    'feature/KP2-B/sprint2',
    'feature/KP2-Z/new-feature',
    'front-A/KP2-123-fix',
    'back-B/KP2-456-update',
    'api-Z/KP2-789-implement',
    'hotfix-front/KP2-123',
    'hotfix-back/KP2-456',
    'hotfix-api/KP2-789',
    'preRelease',
    'release1.0.0'
  ];
  
  // ブランチ名が命名規則に一致するかをチェック
  const isValidBranchName = namingConventions.some(({ pattern }) => pattern.test(branchName));
  
  if (!isValidBranchName) {
    // didyoumeanを使用して最も近いブランチパターンをサジェスト
    const suggestion = didYouMean(branchName, commonBranchPatterns);
    
    // プレフィックスの候補を調べる
    let prefixSuggestion = '';
    for (const prefix of branchPrefixes) {
        if (branchName.includes('/') && prefix.startsWith(branchName.split('/')[0])) {
            prefixSuggestion = prefix;
            break;
        }
    }
    
    let suggestionMessage = '';
    if (suggestion) {
        suggestionMessage = `\n\n**もしかして:** \`${suggestion}\``;
    } else if (prefixSuggestion) {
        suggestionMessage = `\n\n**もしかして:** \`${prefixSuggestion}\` から始まるブランチ名が適切かもしれません`;
    }
    
    fail(`
### 🚫 ブランチ名が命名規則に準拠していません！
現在のブランチ名: \`${branchName}\`${suggestionMessage}

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