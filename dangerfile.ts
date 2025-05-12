import { danger, warn, markdown } from "danger";

const IGNORE_BRANCH = ["release", "revert"];
// マージされるブランチ名
const baseBranch = danger.github.pr.base.ref;
// マージするブランチ名
const headBranch = danger.github.pr.head.ref;

function checkMargeBranchName(headBranch, baseBranch) {
  // ブランチ名にrelease,revertが含む場合チェックしないフラグ
  const isCheckBranch = !IGNORE_BRANCH.find((value) =>
    headBranch.includes(value)
  );
  if (!isCheckBranch) return;

  // PRがdevelopに向いている場合注意文言を表示
  if (baseBranch.includes("main")) {
    fail("Pull requestsの向き先確認");
    markdown(`
### ⚠️ ブランチの向き先確認！
Pull requestsの向き先が\`main\`になっています
向き先が正しいか確認してください！
    `);
  }
}

function checkBranchName(headBranch, baseBranch) {
  const isCheckBranch = !IGNORE_BRANCH.find((value) =>
    headBranch.includes(value)
  );
  if (!isCheckBranch) return;

  const branchPattern = /^feature\/A-\d+\/\w+$/;
  if (!branchPattern.test(headBranch)) {
    warn("無効なブランチ名です");
    markdown(`
### ⚠️ 無効なブランチ名です！
ブランチ名は \`feature/A-XXXX/hogehoge\` のパターンに従う必要があります。
ブランチ名を確認し、正しいことを確認してください。
        `);
  }
}

checkMargeBranchName(headBranch, baseBranch);
checkBranchName(headBranch, baseBranch);
