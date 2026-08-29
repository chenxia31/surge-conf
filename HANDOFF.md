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

## 9. 机场订阅策略组规范（参考 Flower_Trojan）

参考文件（iCloud 云盘）：

- `/Users/chenlongxu/Library/Mobile Documents/iCloud~com~nssurge~inc/Documents/Flower_Trojan.conf`

Claude 在维护机场订阅时，策略组命名与分流应优先对齐以下结构（避免规则组名不一致导致分流失效）：

1. 地区组：`HK` / `JP` / `SG` / `TW` / `US`
2. 总入口组：`Proxies`（聚合地区组与节点）
3. 业务组：`YouTube` `Disney` `Hbomax` `Netflix` `Bahamut` `Bilibili` `Spotify` `Steam` `Telegram` `Google` `Microsoft` `OpenAI` `PayPal` `Apple`
4. 兜底组：`Final`

推荐映射（按 Flower_Trojan 习惯）：

- `YouTube/Disney/Hbomax/Netflix/Telegram/Google/OpenAI` → `select,Proxies,HK,JP,SG,TW,US`
- `Bahamut` → `select,Proxies,HK,TW`
- `Bilibili` → `select,DIRECT,HK,TW`
- `Spotify/Steam/Microsoft/PayPal/Apple` → `select,Proxies,DIRECT,HK,JP,SG,TW,US`
- `Final` → `select,Proxies,DIRECT`

执行要求：

1. 引入新机场订阅时，先确保上述策略组存在，再接入规则。
2. 若机场模板策略组名称不同，优先在模板层做兼容映射，不随意改业务规则里的组名。
3. 在 `README.md` 记录“机场模板基线：Flower_Trojan 策略组兼容”。
4. **节点名称必须与机场下发名称保持一致，不做重命名**（仅做分组，不改节点名本身）。
5. 若出现“策略组名变更”需求，先更新 `surge.conf` 的 `[Proxy Group]` 与 `[Rule]`，再批量同步 README/HANDOFF。

## 10. Quantumult X 规则同步基线（iPhone-240608）

参考文件：

- `/Users/chenlongxu/Library/Mobile Documents/iCloud~com~crossutility~quantumult-x/Documents/Profiles/iPhone-240608.conf`

当前已完成的同步约定：

1. `filter_remote` 优先映射到 Surge 版本规则集并落地到 `rules/sets/`（如 WeChat/Netflix/Apple/BardAI/China）。
2. `filter_local` 已拆分为：
   - `rules/sets/iPhone240608-Local-DIRECT.list`
   - `rules/sets/iPhone240608-Local-PROXY.list`
3. 在 `surge.conf` 中通过 `RULE-SET` 引用以上文件，避免仅依赖外链。

## 11. 机场托管配置（Managed Config）场景

若用户主配置为机场下发的托管配置（首行含 `#!MANAGED-CONFIG`，通常 `strict=true`），Surge 禁止本地编辑，手改会被订阅更新覆盖。**不要尝试改机场配置**，按以下方式处理：

1. 个人规则统一写入 `rules/custom.list`（直连）与 `rules/reject.list`（拦截），格式为不带策略的 RULE-SET 行。
2. 通过模块覆写：模块的 `[Rule]` 会插入到主配置规则之前，优先级高于机场自带规则，且不受订阅更新影响。按机场是否已有策略组二选一：
   - `modules/Custom.sgmodule`：零依赖，仅用 `DIRECT` / `REJECT`，任何配置下都能加载。
   - `modules/FlowerCloud.sgmodule`：按策略组分流，依赖机场存在 `Proxies`、`OpenAI` 组。
3. 模块中引用策略组时必须确认机场配置存在同名组；Surge 无内置 `PROXY` 策略，仅 `DIRECT` / `REJECT` 恒定可用。引用不存在的组会导致整个模块加载失败。
   - 机场组名不同时，只改模块内 `RULE-SET` 行末尾的组名，不改规则文件内容（对应第 9 节「不随意改业务规则里的组名」）。
   - 补充分流模块只收录机场未覆盖的规则（去广告 / Claude / Gemini 等）；机场自带的 Google、YouTube、Netflix、Telegram、Apple、China 保持注释状态，避免重复加载。
4. 需要用本仓库 `surge.conf` 作主配置时，用 `[Proxy Group]` 的 `policy-path` 引入机场订阅。**机场订阅链接含 token，本仓库为公开仓库，禁止提交该链接**。

---

如无额外说明，Claude 按本文档作为默认维护规范执行。
