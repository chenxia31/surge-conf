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

## 机场模板策略组基线

当前机场订阅策略组兼容基线参考：`Flower_Trojan.conf`（iCloud 云盘 Surge 文档）。

推荐保持以下组名：`Proxies`、`HK`、`JP`、`SG`、`TW`、`US`、`YouTube`、`Netflix`、`Telegram`、`Google`、`OpenAI`、`Final` 等，避免规则引用失效。

额外已参考 `iCloud~com~crossutility~quantumult-x/Documents/Profiles/iPhone-240608.conf`，并补充其 `filter_remote` 的 Surge 对应规则与 `filter_local` 转换规则。

## 使用方式

在 Surge 中导入主配置链接即可使用，后续你只需要维护仓库内容并推送到 GitHub，设备端会按链接更新。

## 规则新增示例

在 `rules/custom.list` 追加规则：

`DOMAIN-SUFFIX,github.com,DIRECT`

在 `rules/reject.list` 追加规则：

`DOMAIN-SUFFIX,example-ads.com,REJECT`

## 建议维护流程

1. 在本地修改 `surge.conf` 或 `rules/*.list`
2. 提交并推送到 `main`
3. Surge 通过 Raw 链接拉取最新配置
