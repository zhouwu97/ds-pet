# dsh · ds鲸鲸娘

若叶睦形态大肥鱼，欢迎提交 PR 或者加入修改。

DeepSeek Harness 的 Cordis 插件。沿用 `codex/` 的同一张透明精灵图，人物不重新绘制；深蓝粗边椭圆与两个思考圆点还原参考气泡。平时显示「哦鲸鲸…」，定时报告直接替换这个气泡的文字，到时恢复。

## 能做什么

- 常驻宠物，可拖动位置、调整大小；点击播报，右键或齿轮打开设置。
- 自设提醒间隔（1–1440 分钟）和气泡停留时间（3–60 秒）。
- 勾选 Token、估算花费、账户余额、本月预算剩余，随机挑选或顺序轮播。
- 今天、本月或全部历史用量；缓存命中、缓存写入与输出分别统计。
- 读取 Harness 官方账户服务的充值余额与赠送余额，不要求填写或复制账户密钥。
- 配置每个模型的单价与本月金额 / Token 预算；未知单价、用量缺失、余额查询失败会明确提示。
- 待机、鼠标悬停跳跃、点击挥手、拖动奔跑，以及根据会话状态切换工作、完成、失败动画。鼠标离开恢复会话状态动画。

提醒本身不调用模型、不产生新 Token。花费是按你填写的每百万 Token 单价计算的估算值，账户余额来自账户接口；本月预算是自设目标，不能当作官方套餐总额度。仅统计本机 Harness 保留的会话记录，无法核算其他设备、已删除会话或外部 API 调用。

## 安装

已在 Windows 桌面端内置运行时 **0.2.0-rc.2** 中完成加载测试。运行需要 Harness 的 `connection`、`sessionQuery`、`deepseekAccount` 服务；其他版本需验证这些接口兼容性。

克隆仓库后，使用**桌面端内置 CLI**安装，避免全局旧版 CLI 与桌面配置不兼容。PowerShell 示例：

```powershell
git clone https://github.com/zhouwu97/ds-pet.git
$petDirectory = (Resolve-Path .\ds-pet\dsh).Path.Replace('\', '/')
& '<Harness 安装目录>\resources\runtime\cli\bin\dsh.cmd' plugin --profile desktop add "link:$petDirectory"
```

仓库已附带 `lib/client.js`，安装无需重新构建。安装后在 Harness 插件列表启用 `ds-jingjing-pet`。如果已经打开的窗口未加载新插件，请保存工作后正常重开 Harness。本地链接依赖仓库目录，请保留它。

可先使用独立网页测试配置，不影响桌面插件列表：

```powershell
& '<Harness 安装目录>\resources\runtime\cli\bin\dsh.cmd' --profile jingjing-test --from-default-profile web --help
& '<Harness 安装目录>\resources\runtime\cli\bin\dsh.cmd' plugin --profile jingjing-test add "link:$petDirectory"
& '<Harness 安装目录>\resources\runtime\cli\bin\dsh.cmd' --profile jingjing-test --port 3087
```

## 设置

默认每 10 分钟随机播报一项，显示 8 秒，宠物宽 192 px。「哦鲸鲸」不会随报告消失。

设置保存在 Harness 数据目录的 `storages/ds-jingjing-pet/settings.json`（通常是 `~/.dsh/` 下）。同一数据目录下的配置共享宠物设置。

单价用 `provider/model` 匹配实际调用，设置面板会列出本机历史中发现的模型。四项依次为普通输入、缓存命中、输出、缓存写入的每百万 Token 价格；不用的项目可填 0，整组留空表示不估算该模型。余额金额不会被误用为模型计费单价。

只在窗口可见时定时播报。窗口重新显示后重新计时，不补发积压提醒。它是 Harness 窗口内的宠物；当前版本没有创建系统级透明桌面窗口，窗口关闭后也不会在后台继续弹气泡。

## 开发与验证

```powershell
cd dsh
npm run build
npm run check
npm test
```

没有第三方 npm 运行依赖。修改 `src/client.mjs`、`src/core.mjs` 或 `src/style.css` 后，需重新生成 `lib/client.js`。

目录结构与统计规则见 [DESIGN.md](DESIGN.md)。官方参考：[第一个插件教程](https://deepseek-harness.github.io/deepseek-harness/develop/cordis-tutorial/01-first-plugin)、[Harness 源码](https://github.com/deepseek-ai/deepseek-harness)。

## 许可

[MIT](LICENSE)。分发修改版时保留许可声明。
