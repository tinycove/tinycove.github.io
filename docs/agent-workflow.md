# 开发与质量工作流（dev / QA）

> 2026-11-21（RIGE-1834）修订：**reviewer subagent 退役**（`.agents/agents/reviewer.md` 已删除，
> 原 dev/review/QA 三角色中的 Review 角色不再存在）。
> 现行机制一句话：**审查 = 作者按清单自查；合并门 = main 分支保护；QA = 部署后 canary（`qa.yml`）**。

## 角色

| 角色 | 职责 | 执行者 |
|---|---|---|
| **Dev** | 功能实现、bug 修复、数据管线；push / 开 PR 前按下方「自查清单」逐项核对 | 主 agent（或人工）|
| **QA** | 部署后按「状态矩阵」自动化跑断言；失败项由 agent 诊断修复 | GitHub Actions（`scripts/qa-check.mjs`，零 LLM token）|

## 质量机制与强制点（与平台配置一致，勿凭记忆写反）

| 环节 | 机制 | 强制点 |
|---|---|---|
| 自查 | 作者按 7 项清单核对（下方） | 纪律约束，无服务端强制 |
| 合并门 | **main 分支保护**：require PR + Code Owners review（`.github/CODEOWNERS` = `* @kk17`） | GitHub 平台强制；admin 可 bypass（见下） |
| QA | `qa.yml`：Deploy 成功后对线上 <https://tinycove.space> 跑状态矩阵 | **部署后 canary，不阻断合并**（合并时改动已上线）；红 = 线上已出问题，需尽快修复 |

### 分支保护细则（唯一合并门）

- main 开启 branch protection：**require a pull request before merging**（禁止直推）+ **require review from Code Owners**。
- Code Owners = `@kk17`（全仓），⇒ **外部贡献者的 PR 必须获得 Kyle approve 才能合并**，平台强制。
- **未勾选「Do not allow bypassing」** ⇒ admin（Kyle）可 bypass；bypass 同时覆盖 required review 与禁止直推，
  **对 Kyle 本人没有强制力**——强制力来自「Kyle 自己不绕」。这是有意选择：单人维护仓，
  勾了「Do not allow bypassing」会把主人的改动也卡死。
- **未配置 required status checks**：仓库没有 PR 触发的 CI，配了 required check 会死锁。
  `deploy.yml` 只在 push main 后部署 Pages，`qa.yml` 是部署后 canary——两者都不是合并门。

## 自查清单（7 项，作者 push / 开 PR 前逐项核对）

- [ ] Astro 模板：字符串替换补丁是否把属性挤到标签外（检查所有 `<Base>`/组件标签闭合）
- [ ] `[hidden]` 属性是否有同名 CSS `display` 规则覆盖（全局 `[hidden]{display:none!important}` 已兜底，新增 CSS 不得破坏）
- [ ] i18n：`data-i18n` 引用的 key 是否都在 `i18n.ts` 字典里；`data-tag-dim` 是否在 Base 的 tag 字典维度里
- [ ] 悬空引用：`getElementById` / `querySelector` 的目标是否存在于对应页面
- [ ] BASE_URL：拼接路径是否用 `lib/base.ts`（禁止直接用 `import.meta.env.BASE_URL`）
- [ ] 生成代码的转义：预缓存清单/JSON 注入是否对单引号、中文、方括号做了处理
- [ ] Python 脚本：`py_compile` 通过；无悬空函数引用

清单随 bug 库更新：每修一个新类型 bug，把它的「检查方法」加进来。

## QA 状态矩阵（部署后 canary，自动）

`qa.yml` 在 Deploy 成功后自动对线上跑 `scripts/qa-check.mjs`（CDN 传播竞态自动重试 3 次）。
维度与断言细则见 [docs/qa-matrix.md](qa-matrix.md)。

- QA **不是合并门**：它跑在部署之后，此时改动已经上线；QA 红 = 线上有问题，直接修 bug、重新部署。
- 本地部署前预检可跑 `npm run qa:local`（对 `dist/` 预览产物），属作者自查的一部分，非强制。
- QA 浏览器操作已脚本化（零 LLM token），agent 只负责读报告与修复失败项。
