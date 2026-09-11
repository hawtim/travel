# Travel Roadbook Skill

用于把多日旅行计划快速生成成可部署、可分享、可手机执行的互动路书。

## 文件

- `SKILL.md`：完整规则、技术方案、工作流与 QA checklist
- `REUSE_PROMPT.md`：下一次旅行可以直接复制给 Agent 的复用提示词

## 默认方案

- Leaflet + OpenStreetMap
- 纯静态 HTML / CSS / JS
- 地图固定 `50dvh`
- 单一页面纵向滚动
- 主线 / 可选点 / 住宿 / 航班分层
- Google Maps 仅作为外跳导航
- GitHub Pages：`Deploy from a branch`
- Public repo 默认执行 public-safe 脱敏

## 参考实现

`/2026 胡志明 + 悉尼/`

下一趟旅行优先复用现有 UI，只替换旅行数据和必要文案，避免重新发明整套交互。