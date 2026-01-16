/**
 * 布局引擎 V2.0
 * 负责将模板和数据转换为分页后的渲染数据
 */

// 内联类型定义以确保稳定性
export interface PaperConfig {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number; };
}

export interface PrintElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataKey?: string;
  style?: Record<string, any>;
  [key: string]: any;
}

export interface ComputedPage {
  pageNumber: number;
  totalPages: number;
  elements: PrintElement[];
  paperConfig: PaperConfig;
  pageData: any;
}

export class UnitConverter {
  static mmToPx(mm: number): number {
    return (mm * 96) / 25.4;
  }

  static pxToMm(px: number): number {
    return (px * 25.4) / 96;
  }
}

export class LayoutEngine {
  private template: any;
  private data: any;

  constructor(template: any, data: any) {
    this.template = template;
    this.data = data;
  }

  /**
   * 核心分页方法
   */
  public computePages(): ComputedPage[] {
    const { paper, elements, headerDisplay = 'perPage', footerDisplay = 'perPage' } = this.template;
    const pages: ComputedPage[] = [];
    
    // 1. 识别主体表格
    const tableElement = elements.find((el: any) => el.type === 'table');
    
    if (!tableElement) {
      pages.push({
        pageNumber: 1,
        totalPages: 1,
        elements: [...elements],
        paperConfig: paper,
        pageData: { ...this.data }
      });
      return pages;
    }

    // 2. 准备表格数据
    const rawItems = this.data[tableElement.dataKey] || [];
    
    // 3. 处理分组逻辑
    let processedItems = rawItems;
    if (tableElement.groupBy) {
      processedItems = this.groupData(rawItems, tableElement.groupBy);
    }

    // 4. 分页计算
    const tablePages = this.calculateTablePagination(tableElement, processedItems);

    // 5. 组装最终页面
    const totalPages = tablePages.length;
    for (let i = 0; i < totalPages; i++) {
      const isFirst = i === 0;
      const isLast = i === totalPages - 1;
      
      // 过滤当前页应显示的非表格元素
      const pageElements = elements.filter((el: any) => {
        if (el.type === 'table') return true;
        if (el.type === 'pageInfo') return true;
        
        // 页眉逻辑 (y < table.y)
        const isHeader = el.y < tableElement.y;
        if (isHeader) {
          if (headerDisplay === 'firstPageOnly') return isFirst;
          return true;
        }
        
        // 页脚逻辑 (y > table.y)
        const isFooter = el.y > tableElement.y;
        if (isFooter) {
          if (footerDisplay === 'lastPageOnly') return isLast;
          return true;
        }
        
        return true;
      });

      pages.push({
        pageNumber: i + 1,
        totalPages,
        elements: pageElements.map((el: any) => {
          if (el.type === 'table') {
            // 修正非首页表格的 Y 坐标
            const newY = isFirst ? el.y : paper.margins.top;
            return { ...el, y: newY };
          }
          return el;
        }),
        paperConfig: paper,
        pageData: {
          ...this.data,
          [`__table_${tableElement.id}_data`]: tablePages[i]
        }
      });
    }

    return pages;
  }

  /**
   * 数据分组处理
   */
  private groupData(items: any[], groupBy: string): any[] {
    const groups: Record<string, any[]> = {};
    items.forEach(item => {
      const groupVal = item[groupBy] || '未分类';
      if (!groups[groupVal]) groups[groupVal] = [];
      groups[groupVal].push(item);
    });

    const result: any[] = [];
    Object.keys(groups).forEach(groupName => {
      result.push({ __isGroup: true, groupName });
      result.push(...groups[groupName]);
    });
    return result;
  }

  /**
   * 表格分页核心逻辑
   */
  private calculateTablePagination(table: any, items: any[]): any[] {
    const tablePages: any[] = [];
    const { rowsPerPage, autoFillBlank, columnsCount = 1, dataFlow = 'ltr-ttb' } = table;
    
    // 策略 A: 固定行数分页
    if (rowsPerPage && rowsPerPage > 0) {
      // 1. 将原始数据按列数分块
      // 注意：如果是纵向优先 (ttb-ltr)，逻辑会有所不同，这里先实现横向优先
      const chunkedItems = this.chunkData(items, columnsCount, dataFlow);
      
      for (let i = 0; i < chunkedItems.length; i += rowsPerPage) {
        let pageRows = chunkedItems.slice(i, i + rowsPerPage);
        
        // 2. 尾页自动填充
        if (autoFillBlank && i + rowsPerPage >= chunkedItems.length) {
          const fillCount = rowsPerPage - pageRows.length;
          for (let j = 0; j < fillCount; j++) {
            // 填充空白行，每行包含 columnsCount 个空白单元格
            const blankRow = Array(columnsCount).fill({ __isBlank: true });
            pageRows.push(blankRow);
          }
        }
        tablePages.push(pageRows);
      }
    } 
    // 策略 B: 自动高度分页 (简化版)
    else {
      const defaultRows = 15;
      for (let i = 0; i < items.length; i += defaultRows) {
        const pageItems = items.slice(i, i + defaultRows);
        tablePages.push(pageItems.map(item => [item])); // 包装成单列结构
      }
    }

    return tablePages;
  }

  /**
   * 处理多列数据分块
   */
  private chunkData(items: any[], columns: number, flow: string): any[][] {
    if (columns <= 1) return items.map(item => [item]);

    const result: any[][] = [];
    if (flow === 'ltr-ttb') {
      // 横向优先: [1, 2, 3, 4] -> [[1, 2], [3, 4]]
      for (let i = 0; i < items.length; i += columns) {
        const row = items.slice(i, i + columns);
        // 如果最后一行不满，补齐
        while (row.length < columns) {
          row.push({ __isBlank: true });
        }
        result.push(row);
      }
    } else {
      // 纵向优先: 比较复杂，需要先知道总行数
      // 假设总共有 N 条数据，分 C 列，则每页行数 R = ceil(N / C)
      // 但这里是按 rowsPerPage 分页，所以逻辑是：
      // 每一页取 rowsPerPage * columnsCount 条数据，然后在这页内进行纵向排列
      const pageSize = (this.template.elements.find((el: any) => el.type === 'table').rowsPerPage || 15) * columns;
      for (let i = 0; i < items.length; i += pageSize) {
        const pageItems = items.slice(i, i + pageSize);
        const rowsInThisPage = Math.ceil(pageItems.length / columns);
        
        for (let r = 0; r < rowsInThisPage; r++) {
          const row = [];
          for (let c = 0; c < columns; c++) {
            const index = c * rowsInThisPage + r;
            row.push(pageItems[index] || { __isBlank: true });
          }
          result.push(row);
        }
      }
    }
    return result;
  }
}
