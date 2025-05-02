import { danger, warn, markdown } from "danger";

const IGNORE_BRANCH = ["release", "revert"];
// マージされるブランチ名
const baseBranch = danger.github.pr.base.ref;
// マージするブランチ名
const headBranch = danger.github.pr.head.ref;

function checkBranchName(headBranch, baseBranch) {
  // ブランチ名にrelease,revertが含む場合チェックしないフラグ
  const isCheckBranch = !IGNORE_BRANCH.find((value) =>
    headBranch.includes(value)
  );
  if (!isCheckBranch) return;

  // PRがdevelopに向いている場合注意文言を表示
  if (baseBranch.includes("main")) {
    warn("Pull requestsの向き先確認");
    markdown(`
### ⚠️ ブランチの向き先確認！
Pull requestsの向き先が\`main\`になっています
向き先が正しいか確認してください！
    `);
  }
}

checkBranchName(headBranch, baseBranch);
