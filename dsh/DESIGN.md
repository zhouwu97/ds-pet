# Harness 适配设计

## 插件边界

通过 `package.json` 的 `dsh.bundle` 和 `dsh.client` 入口安装。`cordis.patch.yml` 只插入本插件实例。Host 使用命名导出的 `inject` 与 `apply(ctx)`；Client 注册 ModuleLoader 工厂，依赖官方连接模块。

不修改 Harness 核心源码、已签名安装文件或 Codex 版本。精灵图与 `codex/jingjing-spritesheet.png` 字节一致（1536 × 2288，单格 192 × 208）。只在客户端裁掉原图左上角的小气泡区域，用文字气泡替代，不改人物素材。

## Host / Client 分工

| 文件 | 职责 |
| --- | --- |
| `src/host.mjs` | 读取会话、官方余额、验证并保存设置，注册认证接口 |
| `src/core.mjs` | 设置校验、用量汇总、时区边界、话题选择、报告文案 |
| `src/client.mjs` | Shadow DOM、设置面板、定时器、动画、拖动 |
| `src/style.css` | 独立界面样式，气泡与弹窗布局 |
| `scripts/build.mjs` | 将公共逻辑、样式打包为客户端注册工厂 |
| `lib/client.js` | 随仓库发布的已构建客户端 |
| `tests/` | 统计规则与 Host 接口验证 |

使用四个精确 Fetch 路由：`/api/jingjing/{asset,state,refresh,settings}`。它们复用官方 Connection 的身份验证和 HTTP / 桌面 IPC 传输。核心网关拥有唯一的 `/api` RPC interceptor，因此插件不抢占它。请求与响应使用 Connection RPC envelope，限制方法并验证设置输入。

账户凭据仅由 Harness 的 `deepseekAccount` 服务管理。插件不读取凭据文件，不上传历史、不发送聊天请求。客户端只收到用量汇总、模型路由、余额和素材。

Cordis 管理路由和会话监听的生命周期；客户端卸载时停止轮询、动画和事件监听，移除自身 DOM。设置写入按队列执行，临时文件完成后原子替换。客户端素材加载失败后可自动重试。

## 统计口径

1. 读取 `sessionQuery` 保留的本机会话快照，排除 `inheritedEventCount` 指定的分叉继承事件。
2. 汇总已结束的 `assistant/message` 和失败 `assistant/attempt`。最终 usage 优先；流式 usage 是累计快照，只取最后一条。
3. `inputTokens` 是普通输入；缓存读写另加。`outputTokens` 已包含推理 Token，不再次加 `reasoningTokens`。
4. 缺失或非法 usage 标为缺失，不补成 0。总量存在无法归类的差额时可显示官方总量，但不猜测计费。
5. 每个模型分别匹配用户单价。未知单价、缺失用量或读取失败会阻止完整花费 / 金额预算估算。
6. 今天、本月按客户端当前 UTC 偏移划分；金额和 Token 预算始终按本月计算。
7. 账户余额展示充值与赠送钱包，并按币种分组。不推导官方总套餐额度。自设预算剩余与账户余额分别播报。

用量与余额通常缓存 60 秒；会话结束使统计缓存失效。「刷新用量与余额」立即重新读取。并发刷新复用同一请求。

## 动画与播报

沿用素材的 57 张动作帧与 16 张方向素材；0.2 在空闲状态启用可关闭的 16 方向视线跟随。不是 73 FPS 动画。动画按每帧停留时间和 `requestAnimationFrame` 的经过时间计算，避免固定回调次数造成不同机器播放速度不同。

会话正在运行时切到工作动画；结束后短暂展示完成 / 失败 / 等待状态。悬停循环跳跃，离开恢复会话动画，对应本地 Codex avatar button 的 pointerenter / pointerleave 行为。点击挥手，拖动时左右奔跑；优先级为拖动 > 休息 > 点击动作 > 悬停 > 会话状态 > 空闲视线跟随。触摸输入不模拟悬停，窗口隐藏 / 失焦清除悬停状态。

平时和播报共用一个思考气泡，深蓝粗边椭圆、下沿圆弧和两个圆点按角色参考图绘制，正文仍由清晰文字渲染。播报时气泡扩展并替换文字，到时恢复「哦鲸鲸…」。播报可随机选择已勾选的话题且避免连续重复，也可按勾选顺序轮播。隐藏页面不补发积压提醒。

## 兼容性依据

参考官方教程与源码 `5badb15009ae1756c3afe0ae0cef1faafc290ccc`，实际加载测试使用桌面安装内置 CLI `0.2.0-rc.2` 的独立网页配置。桌面 IPC 使用相同精确 Fetch 路由，但桌面窗口最终显示仍需在安装后重开窗口确认。

Web 与 DSH 使用 `shared/motion.js` 中的同一套动作定义。根目录构建将它同步到 DSH 的 `src/motion.js`，让 DSH 的 npm 包无需依赖父目录。
