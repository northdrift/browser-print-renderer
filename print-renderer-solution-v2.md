# 浏览器端精准打印渲染器技术方案 (V2.0 升级)

**作者：** Manus AI
**日期：** 2026年1月16日

## 1. 概述

本项目旨在开发一个基于 Vue 3 + TypeScript 的浏览器端精准打印渲染器，以实现复杂商业单据（如三联单、送货单）的精确排版和打印。V2.0 版本在 V1.0 的基础上，重点增强了表格的灵活性和分页控制能力，引入了多列排版、分组显示、固定行数分页以及更精细的页眉/页脚显示控制。

## 2. 核心技术栈

*   **前端框架：** Vue 3 (Composition API)
*   **语言：** TypeScript
*   **样式/排版：** CSS 绝对定位 + `@media print` 媒体查询
*   **单位管理：** 统一使用 `mm` 进行配置和内部计算，渲染时转换为 `px`。

## 3. V2.0 新增功能与设计

### 3.1 核心模板配置扩展

为了支持更灵活的页眉、页脚和主体表格的显示控制，`PrintTemplate` 接口将新增以下配置项：

| 配置项 | 作用域 | 类型 | 描述 |
| :--- | :--- | :--- | :--- |
| `headerDisplay` | 模板根配置 | `'perPage' \| 'firstPageOnly'` | 控制页眉元素（非表格表头）的显示策略。 |
| `footerDisplay` | 模板根配置 | `'perPage' \| 'lastPageOnly'` | 控制页脚元素的显示策略。 |
| `tableHeaderDisplay` | 表格元素配置 | `'perPage' \| 'firstPageOnly'` | 控制主体表格的表头是否在每页重复显示。 |

### 3.2 增强型表格功能设计

表格是本次升级的核心。`TableElement` 接口将进行重大扩展。

#### 3.2.1 多列排版与数据流

**需求：** 支持单列、双列、三列或更多列的重复表头显示，并支持两种数据排列方向。

**设计思路：**
1.  **配置扩展：** 在 `TableElement` 配置中新增 `columnsCount: number` (例如 2 或 3) 和 `dataFlow: 'horizontal' \| 'vertical'`。
2.  **数据预处理：** 在 `LayoutEngine` 中，首先根据 `columnsCount` 和 `dataFlow` 对原始数据进行预处理，将一维数组转换为二维结构。
    *   **横向优先 (`horizontal`)：** 数据从左到右填充，然后换行。适用于三联单等需要最大化利用横向空间的场景。
    *   **纵向优先 (`vertical`)：** 数据从上到下填充，然后换列。适用于需要保持数据逻辑顺序的场景。
3.  **组件渲染：** `TableElement.vue` 将根据 `columnsCount` 渲染多组重复的表头和数据列。

#### 3.2.2 分组显示

**需求：** 支持分组显示（分组名称独占一行，紧跟在后面的是明细）。

**设计思路：**
1.  **数据结构：** 假设原始数据中包含一个用于分组的字段（例如 `groupName`）。
2.  **LayoutEngine 逻辑：** 在分页计算时，如果遇到新的分组，`LayoutEngine` 会插入一个特殊的**分组行**。
    *   分组行的高度需要被精确测量。
    *   分组行必须与至少一个明细行一起出现在同一页，防止分组行被分割。
3.  **组件渲染：** `TableElement.vue` 识别到分组行时，渲染一个跨越所有列的特殊样式行，显示分组名称。

#### 3.2.3 固定行数分页与空白行填充

**需求：** 优先按配置的每页显示行数分页，并自动填充尾页空白行。

**设计思路：**
1.  **配置扩展：** 在 `TableElement` 配置中新增 `rowsPerPage: number` 和 `autoFillBlank: boolean`。
2.  **分页算法优先级：**
    *   如果配置了 `rowsPerPage`，分页算法将**优先**按照行数进行分页，而非高度测量。
    *   **例外：** 如果某一行（特别是包含长文本的行或分组行）的高度超过了剩余空间，仍然需要强制换页，以保证行不被分割。
3.  **空白行填充：**
    *   **计算行高：** 在分页计算过程中，记录所有实际渲染的明细行的最小高度 `minRowHeight`。
    *   **尾页处理：** 在最后一页，如果实际行数少于 `rowsPerPage`，则插入 `rowsPerPage - actualRows` 个空白行。
    *   **空白行渲染：** 空白行的高度固定为 `minRowHeight`，以保证尾页的视觉整齐。

## 4. 架构调整与实现计划

| 阶段 | 目标 | 涉及文件 | 关键实现点 |
| :--- | :--- | :--- | :--- |
| **类型扩展** | 定义所有新配置和数据结构。 | `src/types/print.ts` | `HeaderDisplay`, `FooterDisplay`, `TableElement` 接口扩展。 |
| **布局重构** | 实现多列、分组和固定行数分页算法。 | `src/utils/layout.ts` | `processMultiColumnData`, `calculateFixedRowPagination`, `insertGroupRows`, `fillBlankRows` 逻辑。 |
| **组件升级** | 渲染新结构。 | `src/components/PrintProvider.vue`, `src/components/elements/TableElement.vue` | `PrintProvider` 根据 `headerDisplay` 动态过滤元素；`TableElement` 渲染多列和分组行。 |
| **演示升级** | 展示所有新功能。 | `src/App.vue` | 包含一个多列、分组、固定行数分页的综合模板。 |

## 5. 总结

V2.0 升级将使打印渲染器具备处理更复杂、更具规范性的商业单据的能力。通过精确控制分页逻辑和渲染细节，我们将提供一个功能强大且高度可配置的浏览器打印解决方案。

---
**References**
[1] [Vue 3 Composition API Documentation](https://vuejs.org/guide/extras/composition-api-faq.html)
[2] [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
[3] [CSS @media print for print-specific styles](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/print)
[4] [Git CLI Documentation](https://git-scm.com/docs/git)
[5] [GitHub Personal Access Token Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
