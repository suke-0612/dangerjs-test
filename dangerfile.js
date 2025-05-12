import { danger, warn, fail, markdown } from 'danger';

/**
 * 単純なプレフィックスマッチングによるサジェスト機能
 * 入力文字列で始まる候補を返す
 */
function simpleSuggest(input, candidates) {
  return candidates.find(c => c.toLowerCase().startsWith(input.toLowerCase())) || null;
}

/**
 * より複雑なサジェスト機能
 * ブランチ名の部分的なマッチングやパターンベースのサジェストも行う
 */
function suggestBranchName(branchName) {
  // 一般的なブランチパターン
  const commonBranchPatterns = [
    'main',
    'feature/KP2-A/sprint1',
    'feature/KP2-B/sprint2',
    'feature/KP2-Z/new-feature',
    'front-A/KP2-123-fix',
    'front-B/KP2-456-feature',
    'front-Z/KP2-789',
    'back-A/KP2-123',
    'back-B/KP2-456',
    'back-Z/KP2-789',
    'api-A/KP2-123',
    'api-B/KP2-456',
    'api-Z/KP2-789',
    'hotfix-front/KP2-123',
    'hotfix-back/KP2-456',
    'hotfix-api/KP2-789',
    'preRelease',
    'release1.0.0'
  ];

  // プレフィックス候補のリスト
  const prefixCandidates = [
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
    'release'
  ];
  
  // 完全なパターンの提案
  const directSuggestion = simpleSuggest(branchName, commonBranchPatterns);
  if (directSuggestion) {
    return directSuggestion;
  }
  
  // ブランチ名の先頭部分に基づく提案
  // フォーマットの一部が正しければそれを基にサジェスト
  const parts = branchName.split('/');
  if (parts.length > 0) {
    // 例: "feture"を"feature"に修正する提案
    const prefixSuggestion = simpleSuggest(parts[0], prefixCandidates.map(p => p.split('/')[0]));
    if (prefixSuggestion) {
      const matchedPrefix = prefixCandidates.find(p => p.startsWith(prefixSuggestion));
      if (matchedPrefix) {
        return matchedPrefix + (parts.length > 1 ? parts.slice(1).join('/') : '');
      }
    }
    
    // プレフィックスパターンに部分的に一致するものを探す
    if (parts.length >= 1) {
      for (const candidate of prefixCandidates) {
        const candidateParts = candidate.split('/');
        
        // 最初の部分が似ている場合
        if (candidateParts[0].toLowerCase().includes(parts[0].toLowerCase()) || 
            parts[0].toLowerCase().includes(candidateParts[0].toLowerCase())) {
          return candidate;
        }
      }
    }
  }
  
  // 特定のパターンに対する独自の修正提案
  if (branchName.match(/^feat(ure)?\/KP2-/i)) {
    return 'feature/KP2-A/sprint1';
  } else if (branchName.match(/^hot?fix/i)) {
    return 'hotfix-front/KP2-123';
  } else if (branchName.match(/^rel(ease)?/i)) {
    return 'release1.0.0';
  }
  
  return null;
}

/**
 * mainブランチへのマージを検出し、特定の例外ブランチを除いて警告を表示する
 */
function warnOnMainMerge() {
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
    warn(`⚠️ このPRは **main** ブランチへのマージです!`);
    markdown(`
### ⚠️ ブランチの向き先確認!
Pull requestの向き先が\`main\`になっています
向き先が正しいか確認してください!
    `);
  }
}

/**
 * ブランチ名が命名規則に合っているかチェックする
 */
function checkBranchNamingConvention() {
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
    // ブランチ名のサジェスト
    const suggestion = suggestBranchName(branchName);
    
    let suggestionMessage = '';
    if (suggestion) {
      suggestionMessage = `\n\n**もしかして:** \`${suggestion}\``;
    }
    
    fail(`
### 🚫 ブランチ名が命名規則に準拠していません!
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
