# 2026 胡志明 + 悉尼

2026 国庆胡志明 + 悉尼互动路书（公开分享版）。

- 入口：`index.html`
- 地图：Leaflet + OpenStreetMap
- 无需 Google Maps API Key / Billing
- 实际导航可从路书跳转 Google Maps
- 不使用自定义 GitHub Actions 工作流

## Public-safe 处理

公开页面只保留适合分享给搭子的行程信息：

- 保留日期、景点、每日主线、可选点、公共交通和路线地图
- 住宿只显示大致区域，不公开具体酒店、房型、地址和订单信息
- 航班只显示大致时段，不公开航班号和精确起降时间
- 不展示“何时离家 / 何时到家”等个人居住安全信息
- 不包含签证、证件、订单号、联系方式等私人材料

完整的执行信息继续保留在私人行程文档中，不应同步到这个 public repository。

## GitHub Pages

推荐使用 GitHub Pages 的 **Deploy from a branch**，发布源设为：

- Branch: `main`
- Folder: `/(root)`

仓库根目录的 `index.html` 会自动跳转到本路书目录。

访问地址：

`https://hawtim.github.io/travel/`
