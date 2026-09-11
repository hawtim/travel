# 下一趟旅行复用提示词

把下面这段直接交给 Agent，再附上新的旅行计划即可。

---

请使用仓库中的 `skills/travel-roadbook/SKILL.md`，把我这次旅行做成新的互动路书网站。

要求：

1. 复用 `/2026 胡志明 + 悉尼/` 的成熟 UI 和交互，不重新设计底层架构。
2. 默认使用 Leaflet + OpenStreetMap，不使用 Google Maps JavaScript API。
3. Google Maps 只作为“导航”外跳。
4. 地图固定半个可视屏幕高度：`50dvh`，并保留 `50vh` fallback。
5. 整页只允许一个纵向滚动上下文，地图不能阻断页面滚动。
6. 每天区分 `main / optional / hotel / flight`。
7. 支持“显示高密度可选点”开关。
8. 支持每日 hash 分享链接、复制当天、复制全部主线、Google Maps 导航。
9. 跨国飞行日只展示当地实际需要执行的地面路线，不把多个国家压进同一张地图。
10. 如果部署到 public repo，先做 public-safe 脱敏：不公开具体酒店、订单、证件、家庭无人时间等私人信息。
11. 先把新行程整理成 `data.js`，UI 文件只有在确实需要时才修改。
12. 完成后按 Skill 的桌面 / 手机 / 数据 / 隐私 QA Checklist 自检。
13. 提交到 `hawtim/travel` 下一个新的旅行文件夹，并确保 GitHub Pages 可以从总入口访问。

新旅行资料如下：

[在这里粘贴行程 / Google Doc / 每日路线 / 住宿区域 / 交通信息]
