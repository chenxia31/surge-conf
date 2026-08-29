# Surge 配置与规则仓库

这个仓库用于集中管理 Surge 主配置、规则集与后续扩展（如重写集）。

## 本地路径

已克隆到：

`~/Downloads/surge-conf`

## 目录说明

- `surge.conf`：主配置文件
- `rules/custom.list`：自定义规则（优先级最高，建议把个人规则放这里）
- `rules/reject.list`：拦截规则（广告、追踪域名等）
- `rules/sets/*.list`：常用规则集（已复制到本仓库）
- `modules/*.sgmodule`：常用重写模块（已复制到本仓库）

## 订阅链接（Raw）

- 主配置：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/surge.conf`
- 自定义规则：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/custom.list`
- 拦截规则：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/reject.list`

## 已收录规则（Rules）

| 规则名称 | 仓库内文件 | 订阅链接 |
|---|---|---|
| Advertising（去广告） | `rules/sets/Advertising.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/Advertising.list` |
| Google | `rules/sets/Google.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/Google.list` |
| OpenAI | `rules/sets/OpenAI.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/OpenAI.list` |
| Claude | `rules/sets/Claude.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/Claude.list` |
| Gemini | `rules/sets/Gemini.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/Gemini.list` |
| YouTube | `rules/sets/YouTube.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/YouTube.list` |
| Telegram | `rules/sets/Telegram.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/Telegram.list` |
| WeChat | `rules/sets/WeChat.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/WeChat.list` |
| Netflix | `rules/sets/Netflix.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/Netflix.list` |
| Apple | `rules/sets/Apple.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/Apple.list` |
| BardAI | `rules/sets/BardAI.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/BardAI.list` |
| China | `rules/sets/China.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/China.list` |
| iPhone240608 Local PROXY | `rules/sets/iPhone240608-Local-PROXY.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/iPhone240608-Local-PROXY.list` |
| iPhone240608 Local DIRECT | `rules/sets/iPhone240608-Local-DIRECT.list` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/sets/iPhone240608-Local-DIRECT.list` |

## 已收录重写（Modules）

| 重写名称 | 仓库内文件 | 订阅链接 |
|---|---|---|
| AdvertisingLite | `modules/AdvertisingLite.sgmodule` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/AdvertisingLite.sgmodule` |
| General | `modules/General.sgmodule` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/General.sgmodule` |
| SafeRedirect | `modules/SafeRedirect.sgmodule` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/SafeRedirect.sgmodule` |
| Upgrade | `modules/Upgrade.sgmodule` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/Upgrade.sgmodule` |
| BlockHTTPDNS | `modules/BlockHTTPDNS.sgmodule` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/BlockHTTPDNS.sgmodule` |
| Custom Rules（个人规则覆写） | `modules/Custom.sgmodule` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/Custom.sgmodule` |
| FlowerCloud Supplement（机场补充分流） | `modules/FlowerCloud.sgmodule` | `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/FlowerCloud.sgmodule` |

## 机场模板策略组基线

当前机场订阅策略组兼容基线参考：`Flower_Trojan.conf`（iCloud 云盘 Surge 文档）。

推荐保持以下组名：`Proxies`、`HK`、`JP`、`SG`、`TW`、`US`、`YouTube`、`Netflix`、`Telegram`、`Google`、`OpenAI`、`Final` 等，避免规则引用失效。
并保持**节点名称与机场原始下发名称一致**（可调整分组，不改节点名）。

额外已参考 `iCloud~com~crossutility~quantumult-x/Documents/Profiles/iPhone-240608.conf`，并补充其 `filter_remote` 的 Surge 对应规则与 `filter_local` 转换规则。

## 使用方式

### 方式一：直接订阅主配置

在 Surge 中导入主配置链接即可使用，后续你只需要维护仓库内容并推送到 GitHub，设备端会按链接更新。

注意 `surge.conf` 不含 `[Proxy]` 节点，地区组（HK/JP/SG/TW/US）默认为空。接入机场时在 `[Proxy Group]` 用 `policy-path` 引入订阅，例如：

```
HK = select, policy-path=<机场订阅链接>, policy-regex-filter=香港|HK|Hong
```

机场订阅链接自带 token，**不要提交到本仓库**（本仓库为公开仓库），仅在本地配置中填写。

### 方式二：机场托管配置 + 本仓库模块覆写（推荐）

若主配置使用机场下发的托管配置（首行含 `#!MANAGED-CONFIG ... strict=true`），Surge 会禁止本地编辑，手改规则也会被订阅更新覆盖。此时不要改机场配置，改为安装本仓库的覆写模块。

模块的 `[Rule]` 会被插入到主配置规则**之前**，优先级高于机场自带规则，且不受机场订阅更新影响。机场只负责节点，规则完全由本仓库管理。

提供两个模块，按机场配置是否已有策略组选择：

| 模块 | 适用场景 | 依赖 |
|---|---|---|
| `Custom.sgmodule` | 只想加直连 / 拦截规则；或不确定机场组名 | 无（仅用 `DIRECT` / `REJECT`） |
| `FlowerCloud.sgmodule` | 机场已有策略组，需要按组分流（**已按 Flower Cloud 实际组名核对**） | 机场存在 `Proxies`、`OpenAI` |

#### 步骤

1. **确认策略组名**（仅 `FlowerCloud.sgmodule` 需要）。当前 Flower Cloud（`Flower_Trojan.conf`）已核对，存在 `Proxies`、`OpenAI`、`YouTube`、`Google`、`Netflix`、`Telegram`、`Apple`、`Disney`、`Hbomax`、`Bahamut`、`Bilibili`、`Spotify`、`Steam`、`Microsoft`、`PayPal`、`Final` 及 `HK`/`JP`/`SG`/`TW`/`US`，模块可直接使用。更换机场时在 Surge「策略」页复核，组名不一致只需改模块中对应 `RULE-SET` 行末尾的组名，规则文件不用动。
2. **安装模块**：Surge → 模块 → 从 URL 安装，填入对应 Raw 链接：
   - `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/Custom.sgmodule`
   - `https://raw.githubusercontent.com/chenxia31/surge-conf/main/modules/FlowerCloud.sgmodule`
3. **日常加规则**：修改 `rules/custom.list`（直连）或 `rules/reject.list`（拦截），推送到 `main`，在 Surge 模块页下拉刷新即可生效。

#### 注意事项

- Surge 无内置 `PROXY` 策略，只有 `DIRECT` / `REJECT` 恒定可用。模块引用了不存在的策略组会导致**整个模块加载失败**并报错。
- `FlowerCloud.sgmodule` 只补机场未覆盖的部分：域名级去广告、Claude / Gemini / BardAI、个人规则。机场已覆盖 OpenAI、YouTube、Google、Netflix、Telegram、Apple、China 等，重复引入只会增加加载时间。
- **模块规则会插入到主配置规则的最前面**，因此模块中的去广告会先于机场的 `Unbreak.list` 命中。`Unbreak` 是修复去广告误杀的白名单，模块中已在去广告之前重新引入同一份列表。若仍出现误杀，把域名加进 `rules/custom.list`（该规则集排在模块首位，优先级最高）。
- 机场订阅链接中的 `token`、`[Proxy]` 段的节点密码、`ca-p12` 私钥均为凭证，**禁止提交到本仓库**（public）。模块中引用的 `getruleset` 链接不含 token，可以安全公开。
- 若某个策略组在机场配置中确实不存在，可在模块中用 `[Proxy Group]` 段自建一个指向机场已有组的别名组，避免改动规则引用。

## 规则新增示例

RULE-SET 文件内每行**不带策略**，策略由引用方（`surge.conf` 的 `RULE-SET` 语句或 `Custom.sgmodule`）指定。

在 `rules/custom.list` 追加直连规则：

`DOMAIN-SUFFIX,github.com`

在 `rules/reject.list` 追加拦截规则：

`DOMAIN-SUFFIX,example-ads.com`

## 建议维护流程

1. 在本地修改 `surge.conf` 或 `rules/*.list`
2. 提交并推送到 `main`
3. Surge 通过 Raw 链接拉取最新配置
