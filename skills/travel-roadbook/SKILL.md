---
name: travel-roadbook
version: 1.0.0
description: 将一份多日旅行计划转换成可公开分享、可手机使用、可部署到 GitHub Pages 的交互式路书。默认采用 Leaflet + OpenStreetMap，支持每日地图、时间轴、主线/可选点、交通说明、Google Maps 外跳导航与 public-safe 脱敏。
---

# Travel Roadbook Skill

## 目标

把旅行计划变成一个真正可执行的静态路书网站，而不是“把攻略排版成网页”。

最终体验应满足：

1. 打开后先看到当天地图，地图约占 **半个可视屏幕高度**。
2. 向下滚动即可进入当天完整时间轴，不出现嵌套滚动容器。
3. 地图负责建立空间感，详细行程负责执行。
4. 主线、可选点、住宿、机场/航班有明确视觉区分。
5. 不依赖 Google Maps API Key、Billing 或信用卡。
6. 真正导航时通过按钮跳转 Google Maps。
7. 可直接部署到 GitHub Pages。
8. public repo 中不得暴露不必要的私人旅行信息。

## 适用场景

当用户提出以下需求时使用本 Skill：

- “把完整行程做成路书网站”
- “把我的旅行 Google Doc / 行程表变成地图版”
- “给搭子一个可以直接看的旅行页面”
- “把这次旅行部署到 GitHub Pages”
- “沿用之前那套路书做下一趟旅行”

如果用户只要求修改私人 Google Doc，而明确说“不更新路书”，不要同步修改网站。

---

## 默认技术栈

### 地图

默认：**Leaflet + OpenStreetMap**。

原因：

- 免费开源
- 无 API Key
- 无 Billing
- 不要求绑定信用卡
- 静态站即可运行
- 适合个人旅行、小规模分享

不要默认使用 Google Maps JavaScript API。

Google Maps 只作为外部导航目标：

```text
https://www.google.com/maps/dir/?api=1&origin=...&destination=...&waypoints=...
```

### 网站

纯静态：

```text
index.html
styles.css
ux-fix.css
app.js
data.js
ux-fix.js
```

无构建步骤，无框架依赖，无后端。

### 部署

优先：

```text
GitHub Pages
Source: Deploy from a branch
Branch: main
Folder: /(root)
```

如果一个仓库包含多趟旅行：

```text
travel/
├── index.html                  # 总入口
├── .nojekyll
├── 2026 胡志明 + 悉尼/
│   ├── index.html
│   ├── data.js
│   ├── app.js
│   ├── styles.css
│   ├── ux-fix.css
│   └── ux-fix.js
└── YYYY 目的地 A + 目的地 B/
```

不需要为了简单静态 Pages 引入自定义 GitHub Actions workflow。

---

## 输入数据

开始前至少需要这些信息：

- 日期范围
- 每天城市 / 区域
- 每天主线景点
- 可选景点
- 当天交通顺序
- 住宿所在区域
- 机场 / 长途转场
- 可用于地图的经纬度

如果来源是一份私人完整行程文档，应先区分：

### 私人执行信息

可包含：

- 具体酒店名与地址
- 航班号与精确时间
- 订单信息
- 猫咪 / 家庭安排
- 签证、证件、联系方式

### Public-safe 网站信息

默认只公开：

- 日期
- 城市
- 景点
- 每日路线
- 交通方式
- 大致住宿区域
- 必要的机场节点

默认隐藏：

- 具体酒店
- 房型与订单价格
- 精确航班时间、航班号（除非用户明确要求公开）
- 家庭无人时间
- 护照 / 签证 / 订单号
- 电话、邮箱、紧急联系人

如果仓库为 public，提交前必须做一次 public-safe 检查。

---

## data.js 数据模型

推荐结构：

```js
const itinerary = [
  {
    id: '0929',
    date: '9/29',
    weekday: '周二',
    city: '悉尼',
    region: 'au',
    title: 'Watsons Bay + Bondi → Coogee',
    strategy: 'Watsons Bay + Bondi 为主线；Bondi 之后可按体力延伸。',
    stay: 'Harbour / The Rocks 区域住宿。',
    transport: [
      ['去程', 'Circular Quay → F9 Ferry → Watsons Bay'],
      ['转场', '380 Bus → Bondi Beach'],
      ['海岸', 'Bondi → Coogee 步行'],
      ['回城', 'Coogee → Bus → CBD']
    ],
    stops: [
      {
        name: 'Circular Quay',
        lat: -33.8610,
        lng: 151.2127,
        type: 'main',
        note: 'F9 Ferry'
      },
      {
        name: 'Rose Bay',
        lat: -33.8706,
        lng: 151.2685,
        type: 'optional',
        note: '中途站，可不下船'
      }
    ]
  }
];
```

### stop.type

只使用有限集合：

```text
main      主线
optional  可选加密点
hotel     住宿区域
flight    机场 / 航班转场
```

不要随意增加大量视觉类型。

---

## 页面结构

桌面端：

```text
┌──────────────┬────────────────────────┐
│ 左侧日期导航 │ 地图（50dvh）          │
│ sticky       ├────────────────────────┤
│              │ 当天完整详情 / 时间轴   │
│              │                        │
└──────────────┴────────────────────────┘
```

移动端：

```text
日期列表
↓
地图（50dvh）
↓
当天详情
↓
时间轴
↓
交通 / 判断 / 住宿
```

核心原则：**整页只有一个纵向滚动上下文。**

禁止：

- `.main` 自己 `overflow:auto`
- `.detail` 再做独立滚动
- 固定高度的 timeline
- 地图截获页面的滚轮滚动

---

## 地图 UX 规则

### 1. 高度固定半屏

统一使用：

```css
.map-wrap {
  height: 50vh;
  height: 50dvh;
}
```

这样横屏、竖屏均能保持稳定比例。

### 2. 地图不抢页面滚动

桌面：

```js
map.scrollWheelZoom.disable();
```

用户滚轮应浏览路书，而不是无意缩放地图。

地图缩放使用 Leaflet `+ / −` 控件。

触屏设备可进一步关闭拖拽 / touch zoom，使纵向手势优先滚页面。

### 3. 左上角控件安全区

Leaflet 默认缩放按钮在左上角。

自定义顶部标题必须避开该区域，例如：

```css
.map-top {
  left: 72px;
}
```

不要让“当天标题 / 适应完整路线”覆盖 `+ / −`。

### 4. fitBounds

切换日期时：

1. `invalidateSize()`
2. 下一帧再 `fitBounds()`
3. 使用 padding
4. resize 后重新计算

推荐：

```js
map.invalidateSize({ pan: false });
requestAnimationFrame(() => {
  map.fitBounds(bounds, {
    paddingTopLeft: [58, 70],
    paddingBottomRight: [58, 74],
    maxZoom: 15
  });
});
```

### 5. 跨国飞行日

不要把多个国家的机场强行塞在一张地图里，否则地图会缩到世界尺度。

只展示当天实际需要执行的本地地面段。

例如：

```text
深圳 → 胡志明
```

地图只显示：

```text
SGN → 胡志明住宿区域
```

航班信息放时间轴。

---

## 时间轴 UX 规则

每个 stop：

```text
圆形编号 | 地点标题
         | 备注
         | badge
```

连接线应始终落在编号列中间。

### 避免 class 名冲突

这是第一版实际踩过的坑：

页面主容器使用：

```html
<main class="main">
```

而主线 stop 也会生成：

```html
<div class="stop main">
```

所以 CSS **绝对不要**直接写：

```css
.main { ... }
```

页面级规则必须限定：

```css
.app > main.main { ... }
```

时间轴主线明确恢复：

```css
.timeline .stop.main {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
}
```

否则会出现：

- 主线节点错位
- 可选点正常、主线点异常
- timeline 高度计算错误
- 页面无法滚到底部

---

## 主线 / 可选点模型

路书必须支持一个全局 toggle：

```text
显示高密度可选点
```

开：展示完整高密度版本。

关：只保留主线。

可选点必须满足至少一个条件：

- 与主线同一地理 cluster
- 顺路
- 可随时退出
- 删除后不破坏当天逻辑

不要把“完全不同的备选行程”混成 optional stop。

---

## 详情区

每一天至少展示：

### 时间轴

按执行顺序列所有点。

### 当天判断

一句到两句回答：

```text
今天什么必须完成？
什么情况下砍项目？
```

### 交通顺序

不要只写“公共交通”。应写真实执行锚点：

```text
F9 Ferry
380 Bus
F1 Ferry
BMT
686 / 686G
```

无需保证数月后的发车时刻，但线路关系应准确。

### 住宿 / 转场

公开版只写区域：

```text
Harbour / The Rocks 区域住宿
Central / Haymarket 区域住宿
```

---

## Google Maps 外跳

页面内不嵌 Google Maps API。

提供按钮：

```text
Google Maps 导航
```

构造 URL：

- 第一个 stop = origin
- 最后一个 stop = destination
- 中间 stop = waypoints
- Google URL waypoints 过多时采样至合理数量

这只是辅助导航。

公交 / Ferry / Train 的实际执行顺序以路书文字和当天实时查询为准。

---

## 分享能力

每日行程应有稳定 hash：

```text
#0929
#1003
```

点击某一天：

```js
location.hash = itinerary[i].id;
```

因此可以直接给搭子发送某一天：

```text
https://example.github.io/travel/某趟旅行/#0929
```

同时支持：

- 复制当天
- 复制全部主线
- 复制此日链接

---

## GitHub Pages 发布规范

### Public repo

推荐。

优点：

- Pages 简单
- 标准公开仓库 Pages 成本低
- 无需额外服务

### 发布前隐私检查

搜索：

```text
酒店具体名称
航班号
订单号
手机号
邮箱
护照
签证号码
家庭无人
精确住址
```

### 历史提交

不要先把敏感信息提交到 public repo 再删除。

Git 历史可能仍保留旧内容。

如果误提交：

- 重写分支历史
- 必要时处理 dangling commit
- 对真正的 secret / credential 应直接 revoke，而不是只依赖 Git 清理

---

## 工作流

### A. 新建路书

1. 获取最新旅行计划。
2. 识别每日主线与 optional。
3. 给所有地图点补经纬度。
4. 先生成 `data.js`。
5. 复用现有 UI 框架。
6. 检查地图 fitBounds。
7. 检查移动端 50dvh。
8. 检查 timeline 完整滚动。
9. 做 public-safe 脱敏。
10. 提交 GitHub。
11. Pages 发布。

### B. 行程变化

如果只是：

```text
某天新增 / 删除 / 调整景点
```

优先只更新：

```text
data.js
```

不要无必要改 UI。

### C. UI Bug

先判断属于：

```text
地图尺寸
滚动上下文
CSS class 冲突
响应式断点
Leaflet invalidateSize
缓存
```

不要在多个文件同时堆临时 patch。

稳定后应把 fix 收敛到清晰的 CSS / JS 规则。

---

## QA Checklist

提交前逐项检查：

### 桌面

- [ ] 左侧日期导航可滚动
- [ ] 右侧页面只有一条纵向滚动
- [ ] 地图占 50% viewport 高度
- [ ] 鼠标滚轮落在地图上仍能滚页面
- [ ] `+ / −` 未被标题遮挡
- [ ] “适应完整路线”工作正常
- [ ] 所有主线 / optional marker 可见
- [ ] timeline 编号与标题无错位
- [ ] 页面可以滚到最后一个 stop

### 手机

- [ ] 地图使用 `50dvh`
- [ ] 上下滑优先滚页面
- [ ] 没有横向溢出
- [ ] 标题不会覆盖地图控件
- [ ] 详情按钮可以换行
- [ ] 时间轴完整显示

### 数据

- [ ] optional toggle 正常
- [ ] hash 直达某一天正常
- [ ] Google Maps 外跳正常
- [ ] 跨国日没有世界级缩放
- [ ] 住宿区域 / 交通信息一致

### 隐私

- [ ] 无订单号
- [ ] 无证件信息
- [ ] 无家庭无人时间
- [ ] 无不必要具体酒店地址
- [ ] 无 API Key / `.env`

---

## 参考实现

当前第一版参考实现：

```text
hawtim/travel
└── 2026 胡志明 + 悉尼/
```

它是本 Skill 的基准实现。

复用时优先：

1. 复制结构与 UI 行为。
2. 重写 `data.js`。
3. 替换标题 / metrics。
4. 根据新行程微调地图点。
5. 不复制原旅行的私人数据。

---

## 成功标准

一个合格的 Travel Roadbook 应让用户旅行当天做到：

> 打开页面 → 看到今天去哪 → 看地图理解空间关系 → 往下滚直接按顺序执行 → 状态不好就关掉 optional → 需要真正导航时点 Google Maps。

如果用户需要不断在地图、攻略文档、聊天记录和交通备注之间来回切换，说明路书还没有完成。