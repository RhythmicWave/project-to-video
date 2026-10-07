# 后端状态资源与提交边界

当项目涉及应用实例、消息批次、缓存快照、租约或事务时，使用 [BackendResources.tsx](../assets/remotion-template/src/visual/BackendResources.tsx)。执行进程使用服务机架，区别于已有机器人参与者；快照和消息使用不同容器，避免把它们都画成数据库。

## 组件契约

组件位于父级SVG中，字体继承父级；`x/y` 是局部原点，`scale` 默认1。图形与标签都受同一缩放影响。状态必须由场景输入，不由图标推断项目保证。

| 组件 | 输入 | 图形边界（未缩放） | 标签与适用边界 |
| --- | --- | --- | --- |
| WorkerRack | label；state=`idle/active/blocked/error/done` | 中心原点，x ±100、y ±72 | 标签基线y=110；表示服务/执行进程，不表示线程数或自主Agent |
| EventRail | label；entries含唯一id、label、可选state=`pending/selected/marked`；width默认460 | 左上原点，width×144 | 0–5个可见条目；标签基线y=183；marked只表示给定的消息标记，不能推断实际commit、持久化或恰好一次 |
| SnapshotStack | label、generation、rows；freshness=`fresh/expired`；width默认340 | 主卡width×226；叠页向右/向上延伸16 | 最多4行；标签基线y=265；generation是显示标签，不要求系统存在版本字段；expired不自动触发降级 |
| LeaseBadge | label、holder、remaining、status=`held/expired/lost`；width默认360 | 左上原点，width×180 | remaining必须为0–1；持有者、过期与接管由场景提供，不承诺业务互斥或旧执行者被终止 |
| AtomicWriteSet | label、rows含label/before/after；phase=`before/prepared/committed/aborted`；width默认720 | 左上原点，高度120+74×行数 | 1–4行，共同提交/回滚；只用于真实同一事务中的写入，不能把数据库、Redis、Kafka画进一个原子边界 |

标签需要留在图形之外的独立文字区。消息轨道与快照的底部标签不是连线端口；连接从图形边界出发，绕过标签区。最长标签、条目数和缩略显示都需要实际渲染检查。优先缩短标签或展开局部，不缩小所有文字来塞内容。

所有组件本身都不读时钟。实际执行用[因果时间轴](causal-timeline.md)派生资源状态、发送/接收和提交；纯结构可以直接用 Transfer/Connect。租约进度可压缩展示，但实际 TTL/续约配置与教学时间分开。

## 从资源到完整行为

### 参与者轮廓

[BackendGlyphs.tsx](../assets/remotion-template/src/visual/BackendGlyphs.tsx) 提供 `BackendGlyph`：客户端、网关、服务、Repository、数据库、缓存、事件中间件、消费者、时钟、堆和脚本。它适合系统总图与局部机制使用同一套轮廓；DAO 可用脚本轮廓，物理数据库才用圆柱。

必需输入 `x/y/kind/label`；原点是图形中心，`scale` 默认 1，`color` 控制描边与标签。`labelLines` 可拆长类名，`symbol` 放方法或脚本名，`labelSize` 默认 27。`serviceMark` 默认 API，可由项目指定运行时标记。`active` 绘制执行环，项目用对应 task.phase=running 驱动；镜头聚焦改用外围方框或区域高亮，锁持有者由租约状态独立表示。图形约 x±76、y−82..72，网关连线扩至x±94，活动环半径90；标签基线 y=108，每行增加29，symbol 再下移34。连线绕开图形与完整标签区。

[BackendGlyphsDemo.tsx](../assets/remotion-template/src/scenes/BackendGlyphsDemo.tsx) 为 8 秒中性图标扫描，注册为 BackendGlyphsDemo。[预览](../assets/previews/backend-glyphs.mp4)由同一 SVG 实现生成，不使用第三方素材。它不依赖项目语言、类名或业务链路；复制模板后可使用 Remotion CLI 渲染该 Composition。

- **事件处理**：显示批次 → 选出有效事件 → 持久化后状态变化 → 消息进度。去重键、业务状态与消费位点是不同对象，只有实现存在的边界才共同更新。
- **共享快照**：计算者写入一份结果，读取者从该容器取得数据；本地副本应显示实例归属。故障返回旧副本时，保留时效状态，并解释空副本/冷启动分支。
- **租约接管**：先有候选集合，再出现持有者，续约停止后过期，另一个实例接管。旧执行者是否终止、是否还能写结果必须按源码独立表现。
- **事务写集合**：before → prepared → committed；失败路径prepared → aborted。成功后回滚属于另一笔事务，不能在同一事务动画中倒放伪装为恢复。

这些模式用于选择表达，不规定所有项目必须同时出现五种资源。

## 中性演示与检查

[BackendResourcesDemo.tsx](../assets/remotion-template/src/scenes/BackendResourcesDemo.tsx) 注册为`BackendResourcesDemo`，1280×720、30fps、24秒：前8秒展示服务与消息，中间8秒展示快照时效与租约接管，后8秒并排展示提交与回滚。标签仅包含中性进程、条目和记录，不依赖任何业务项目。

复制模板到项目后：

```text
npm ci
npm run check
npm run check:layout
npm run render:backend
```

已有浏览器无法自动获得时，可给Remotion CLI提供`--browser-executable=<已安装浏览器路径>`；这是离屏渲染器，浏览器UI预览按用户选择另行处理。

检查重点：消息状态与消费结果的区别、快照标签是否挡线、租约换主后的旧提示是否清除、事务行是否同步切换、图标缩小时状态是否仍可辨认。第三方图标服务与外部图片不是必需依赖；此资源由本仓库SVG代码绘制。
