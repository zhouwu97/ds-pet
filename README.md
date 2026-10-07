# 大肥鱼 · ds 鲸鲸娘

若叶睦形态大肥鱼，陪你工作，也陪你摸鱼。同一只蓝发小伙伴，可以用在 **Codex、DeepSeek Harness 和 Web**。

[选择版本](#选择你的版本) · [素材下载](#素材下载) · [Web 预览](#web-本地预览) · [开发](#开发与验证) · [参与改进](#想要大肥鱼更完善来提交吧)

<img src="codex/previews/jingjing-all-states.gif" alt="鲸鲸娘动作预览" width="480" />

## 选择你的版本

| 版本 | 适合什么场景 | 功能与入口 |
| --- | --- | --- |
| **[Codex](codex/README.md)** | Codex / ChatGPT Work Pets | 导入 Work Pets v2 精灵图；动画由客户端驱动 |
| **[DSH](dsh/README.md)** | DeepSeek Harness 窗口内陪伴 | 拖动、视线跟随、投喂、休息、会话状态动画，以及用量 / 余额气泡 |
| **[Web](web/README.md)** | 普通 HTML、Vue、React 等网站 | 独立 Web Component；人物出窝、回窝，控件留在原位 |

三端使用同一张透明精灵图。**Web 与 DSH 共用动作时长和方向定义；Codex 的交互方式取决于客户端。** 它们不会因为使用同一套素材而自动共享账户、会话或偏好设置。

## 互动方式

Web 与 DSH 都支持点击挥手、悬停跳跃、拖动奔跑、闲暇时看向鼠标，以及投喂和休息 / 唤醒。气泡位于人物左上方，随人物移动。

- **Web**：点击「放出来」，只有人物和气泡进入透明浮层。原位保留召回入口；双击、右键人物或聚焦后按 Escape 可以回窝。出窝轻跳，回窝奔跑并招手，拖动可打断过渡。
- **DSH**：跟随真实会话显示工作、等待、完成和失败状态。可定时播报 Token、估算花费、账户余额或自设预算剩余；点击人物立即播报，右键进入设置。
- **减少动态效果**：Web / DSH 尊重系统设置；DSH 另有手动开关。页面隐藏时暂停动画，恢复后不补发积压提醒。

桌宠互动不调用模型。DSH 通过 Harness 的服务读取本机用量与账户余额；Web 不读取账户、不上传对话，也没有聊天输入框。

## 素材下载

| 文件 | 用途 |
| --- | --- |
| **[完整精灵图 PNG](codex/jingjing-spritesheet.png)** | 导入 Codex，或供其他适配器使用 |
| [动作预览 GIF](codex/previews/jingjing-all-states.gif) / [MP4](codex/previews/jingjing-all-states.mp4) | 查看动作效果 |
| [静态动作总览](codex/previews/jingjing-stills.png) | 检查各状态 |
| [16 方向总览](codex/previews/jingjing-directions.png) | 查看视线方向 |
| [素材信息与 SHA-256](codex/asset-info.json) | 核对尺寸、版本和文件一致性 |

在 GitHub 打开 PNG 后选择 **Download raw file**，保留原尺寸与透明通道。素材为 **1536 × 2288 px**，8 列 × 11 行，每格 192 × 208 px，共 57 张动作帧和 16 张方向帧。73 是有效帧数量，不是帧率。

## Web 本地预览

使用 Node.js 22 或更高版本：

```bash
git clone https://github.com/zhouwu97/ds-pet.git
cd ds-pet
npm run preview
```

打开 [http://127.0.0.1:4175](http://127.0.0.1:4175)。预览服务无需安装依赖；模块需要 HTTP 服务，不能直接双击演示 HTML。

嵌入自己的网站时，保留 `web/`、`shared/` 和 `codex/` 的相对目录：

```html
<jingjing-pet
  src="/pets/codex/jingjing-spritesheet.png"
  storage-key="my-site-jingjing"
></jingjing-pet>
<script type="module">
  import { registerJingjingPet } from '/pets/web/jingjing-pet.js';
  registerJingjingPet();
</script>
```

组件使用 Shadow DOM，无框架运行依赖。样式变量、宿主状态 API 和生命周期说明见 [Web 文档](web/README.md)。个人主页接入示例见 [claawqianduan](https://github.com/zhouwu97/claawqianduan)。

## DSH 安装

仓库附带已构建客户端，无需自行打包。克隆后，用 **Harness 桌面端内置 CLI** 安装本地链接：

```powershell
$petDirectory = (Resolve-Path .\ds-pet\dsh).Path.Replace('\', '/')
& '<Harness 安装目录>/resources/runtime/cli/bin/dsh.cmd' plugin --profile desktop add "link:$petDirectory"
```

以上命令在 `ds-pet` 的父目录执行；将占位路径换成自己的 Harness 安装目录。安装后启用 `ds-jingjing-pet`，正常重开 Harness 加载插件。本地链接依赖仓库目录，请保留它。

DSH 需要 `connection`、`sessionQuery`、`deepseekAccount` 服务。安装、设置、兼容性与统计口径详见 [DSH 文档](dsh/README.md)。估算花费依赖用户填写的单价，自设预算不代表官方套餐额度。

## 开发与验证

```bash
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:browser
```

`npm run build` 将共享动作定义同步到 DSH 包内并生成 `dsh/lib/client.js`。修改共享动作、DSH 客户端或样式后，请重新构建并提交生成文件。

| 路径 | 内容 |
| --- | --- |
| `codex/` | 原始精灵图、校验信息与动作预览 |
| `shared/motion.js` | Web / DSH 共用的动作、方向和边界计算 |
| `web/` | 原生 Web Component 与演示页 |
| `dsh/src/` | Harness 客户端、Host 与统计逻辑 |
| `dsh/lib/client.js` | 可直接加载的 DSH 客户端产物 |
| `tests/`、`dsh/tests/` | 动作、统计、接口与浏览器测试 |

浏览器回归覆盖跟随气泡、拖动边界、出窝 / 回窝、动画打断、设置恢复与卸载清理。DSH 测试使用模拟 Connection RPC，不连接真实账户；客户端兼容性说明见对应版本文档。

## 想要大肥鱼更完善，来提交吧

欢迎 [提 Issue](https://github.com/zhouwu97/ds-pet/issues) 或 [提交 Pull Request](https://github.com/zhouwu97/ds-pet/pulls)。

反馈问题时请说明使用哪一端、客户端版本、复现步骤，以及是否开启减少动态效果；如果是显示问题，附一张截图会更容易定位。修改素材时请保留 v2 网格与透明通道，并更新校验信息和预览。

## 许可

素材与代码采用 [MIT License](LICENSE)，可使用、修改和分发；请保留许可声明。
