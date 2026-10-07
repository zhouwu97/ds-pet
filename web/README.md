# Web · 大肥鱼桌宠

原生 Web Component，无运行依赖，可以嵌入 Vue、React 或普通 HTML。复用 `codex/jingjing-spritesheet.png`，不调用模型、不上传数据，也不提供聊天输入框。

## 预览

在仓库根目录运行 `npm run preview`，打开 http://127.0.0.1:4175 。必须通过 HTTP 服务加载 ES 模块，不能直接双击 HTML。

## 嵌入

保留 `web/`、`shared/` 和 `codex/` 的相对目录，或者自行调整导入与素材路径：

```html
<jingjing-pet src="/pets/codex/jingjing-spritesheet.png"
  storage-key="my-site-jingjing"></jingjing-pet>
<script type="module">
  import { registerJingjingPet } from '/pets/web/jingjing-pet.js';
  registerJingjingPet();
</script>
```

给容器至少 240px 宽。组件使用 Shadow DOM 隔离样式；通过 `--pet-text`、`--pet-muted`、`--pet-accent`、`--pet-line` 和 `--pet-surface` 调整颜色。省略 `storage-key` 时不保存偏好；提供时仅将大小和视线跟随选项存入浏览器。

## 交互

- 点击、Enter 或空格：挥手；悬停：跳跃；闲暇时：16 方向视线跟随。
- 鼠标或触摸拖动：按左右方向播放奔跑，位置限制在可见范围；方向键微调。
- 招手、投喂、休息 / 唤醒；「放出来」仅让人物和气泡进入透明浮层，控件留在窝里；支持召回、双击 / 右键人物或聚焦后按 Escape 回窝。
- 人物浮层挂载在 `document.body`，避开祖先的 transform / backdrop-filter 对固定定位的限制。原组件保留召回入口；离开页面时移除组件即可清理监听、动画和浮层。
- 出窝轻跳、回窝奔跑，使用 240ms 的 transform 过渡；拖动可打断过渡，减少动态效果和键盘触发时直接切换位置。
- 自动适配系统减少动态效果；隐藏或离开视口暂停动画；加载失败显示提示。

宿主可驱动真实状态：

```js
const pet = document.querySelector('jingjing-pet');
pet.setActivity('running'); // idle / running / waiting / review / failed
pet.play('waving', '任务完成啦'); // 临时动作，结束恢复宿主状态
```

演示页的状态按钮仅模拟状态。Web 不访问 Codex 或 DSH 的账户、会话、用量接口；DSH 的统计继续由其独立适配器处理。

## 源码同步

`shared/motion.js` 是 Web / DSH 的公共动作时长与方向定义。仓库根目录 `npm run build` 会同步到 DSH 包内并生成 `dsh/lib/client.js`。Codex 的动画策略由客户端控制，精灵图未修改。

个人主页仓库中运行 `node scripts/sync-pet.mjs ../cw`，同步组件、动作定义、精灵图及 MIT 许可。
