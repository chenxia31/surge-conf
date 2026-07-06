# Surge Config Repo

这个仓库用于集中管理你的 Surge 配置与规则。

## 结构

- `surge.conf`: 主配置文件
- `rules/custom.list`: 你的自定义规则
- `rules/reject.list`: 拦截规则

## 直接使用

- 主配置订阅链接：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/surge.conf`
- 自定义规则链接：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/custom.list`
- 拦截规则链接：`https://raw.githubusercontent.com/chenxia31/surge-conf/main/rules/reject.list`

## 如何新增规则

在对应的 `.list` 文件里追加一行规则即可，例如：

`DOMAIN-SUFFIX,github.com,DIRECT`
