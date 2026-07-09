# HANDOFF：Surge 配置仓库（给 Claude 的维护说明）

本文档用于让 Claude（或其他 AI 代理）稳定接管本仓库的规则与重写管理工作。

## 1. 维护目标

1. 保持 `surge.conf` 可直接订阅、结构清晰。
2. 常用规则集与重写模块优先使用仓库内文件（避免外部链接不稳定）。
3. 所有新增/变更都要在 `README.md` 标记并可追溯。

## 2. 仓库结构

- `surge.conf`：主配置入口
- `rules/custom.list`：用户自定义规则（高优先级）
- `rules/reject.list`：本地基础拦截
- `rules/sets/*.list`：收录的常用规则集（第三方同步到本仓库）
- `modules/*.sgmodule`：收录的重写模块（第三方同步到本仓库）
- `README.md`：对外说明与已收录清单

## 3. 规则与模块的管理原则

1. **新增规则集**：先落地到 `rules/sets/`，再在 `surge.conf` 的 `[Rule]` 添加 `RULE-SET` 引用。
2. **新增重写模块**：先落地到 `modules/`，再在 `surge.conf` 的 `[Module]` 添加链接。
3. **策略组名称**：
   - 去广告类默认 `REJECT`
   - AI / Google / YouTube / Telegram 默认 `PROXY`
   - 若策略组命名发生变更，只改 `surge.conf` 引用，不改规则内容。
4. 不删除用户已有 `custom.list` 规则，用户自定义始终优先。

## 4. 标准变更流程（Claude 执行）

1. 拉取最新代码并检查工作区。
2. 新增或更新 `rules/sets/*.list` / `modules/*.sgmodule`。
3. 更新 `surge.conf` 引用（只做必要改动）。
4. 更新 `README.md` 的“已收录规则 / 已收录重写”表格。
5. 提交并推送。

## 5. 提交流程要求

1. 提交信息使用动词开头，例如：`Add xxx ruleset`、`Update xxx module`。
2. 每次提交必须包含本次收录清单变更（README 同步）。
3. 避免把无关格式化改动混入提交。

## 6. 快速检查清单（提交前）

1. `surge.conf` 中所有新增链接都指向本仓库 `main` 分支 Raw 地址。
2. `README.md` 表格与实际文件一致（名称、路径、链接一致）。
3. 新增 `.list` / `.sgmodule` 文件可读且非空。

## 7. 常用 Raw 链接模板

- 规则集：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/<NAME>.list`
- 重写集：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/<NAME>.sgmodule`
- 主配置：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/surge.conf`

## 8. 回滚策略

若新增规则导致误拦截或服务异常：

1. 在 `surge.conf` 临时注释对应 `RULE-SET` / `Module` 引用；
2. 或将问题文件回退到上一个稳定版本；
3. README 记录回滚项，避免后续重复引入。

---

如无额外说明，Claude 按本文档作为默认维护规范执行。
