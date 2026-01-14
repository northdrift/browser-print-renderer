// 内联类型定义
export interface PaperConfig {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number; };
}

export interface PrintElement {
  id: string;
  type: 'text' | 'image' | 'qrcode' | 'barcode' | 'line' | 'rect' | 'table' | 'pageInfo';
  x: number;
  y: number;
  width: number;
  height: number;
  dataKey?: string;
  style?: Record<string, any>;
}

export interface TableRow {
  height: number;
  heightMode: 'fixed' | 'auto';
  cells: any[];
}

export interface TableElement extends PrintElement {
  type: 'table';
  header?: {
    rows: TableRow[];
    repeat: 'all' | 'first' | 'none';
  };
  footer?: {
    rows: TableRow[];
    repeat: 'all' | 'last' | 'none';
    position: 'fixed' | 'follow';
  };
  body: {
    dataKey: string;
    layout: 'ltr-ttb' | 'ttb-ltr';
    rowTemplate: TableRow;
  };
}

export interface ComputedPage {
  pageNumber: number;
  totalPages: number;
  elements: PrintElement[];
  paperConfig: PaperConfig;
  pageData: any;
}

export interface BusinessData {
  [key: string]: any;
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
  private data: BusinessData;
  private measurementTool: HTMLElement | null = null;

  constructor(template: any, data: BusinessData) {
    this.template = template;
    this.data = data;
  }

  private initMeasurementTool() {
    if (typeof document === 'undefined') return;
    this.measurementTool = document.getElementById('print-measurement-tool');
    if (!this.measurementTool) {
      this.measurementTool = document.createElement('div');
      this.measurementTool.id = 'print-measurement-tool';
      this.measurementTool.style.position = 'absolute';
      this.measurementTool.style.left = '-9999px';
      this.measurementTool.style.top = '-9999px';
      this.measurementTool.style.visibility = 'hidden';
      this.measurementTool.style.pointerEvents = 'none';
      document.body.appendChild(this.measurementTool);
    }
  }

  private calculateRowHeight(row: TableRow, rowData: any): number {
    if (row.heightMode === 'fixed') {
      return UnitConverter.mmToPx(row.height);
    }

    this.initMeasurementTool();
    if (!this.measurementTool) return UnitConverter.mmToPx(row.height);

    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    rowDiv.style.width = '100%';
    rowDiv.style.borderCollapse = 'collapse';
    // 确保测量时的字体与实际一致
    rowDiv.style.fontFamily = 'sans-serif';
    rowDiv.style.fontSize = '12px';
    
    row.cells.forEach(cell => {
      const cellDiv = document.createElement('div');
      cellDiv.style.width = `${UnitConverter.mmToPx(cell.width)}px`;
      cellDiv.style.border = '1px solid black';
      cellDiv.style.padding = '2px';
      cellDiv.style.boxSizing = 'border-box';
      cellDiv.style.wordBreak = 'break-all';
      
      let content = '';
      cell.content.forEach((el: any) => {
        if (el.dataKey) {
          content += String(rowData[el.dataKey] || '');
        } else {
          content += String(el.content || '');
        }
      });
      cellDiv.innerText = content;
      rowDiv.appendChild(cellDiv);
    });

    this.measurementTool.innerHTML = '';
    this.measurementTool.appendChild(rowDiv);
    const height = rowDiv.getBoundingClientRect().height;
    this.measurementTool.innerHTML = '';
    
    return Math.max(height, UnitConverter.mmToPx(row.height));
  }

  public computePages(): ComputedPage[] {
    const pages: ComputedPage[] = [];
    const { paper, elements } = this.template;
    
    const pageInnerHeightPx = UnitConverter.mmToPx(paper.height - paper.margins.top - paper.margins.bottom);
    const tableElement = elements.find((el: any) => el.type === 'table') as TableElement | undefined;
    
    if (!tableElement) {
      pages.push({
        pageNumber: 1,
        totalPages: 1,
        elements: [...elements],
        paperConfig: paper,
        pageData: {}
      });
      return pages;
    }

    // 分离元素：表头（y < table.y）、表尾（y > table.y）
    const headerElements = elements.filter((el: any) => el.type !== 'table' && el.y < tableElement.y);
    const footerElements = elements.filter((el: any) => el.type !== 'table' && el.y > tableElement.y);
    // 其他元素（如页码，通常在页面底部，不随表格分页变化）
    const otherElements = elements.filter((el: any) => el.type !== 'table' && el.y >= tableElement.y && el.type === 'pageInfo');
    
    const tableData = this.data[tableElement.body.dataKey] || [];
    let currentRowIndex = 0;
    let currentPageNumber = 1;

    const tableHeaderHeightPx = tableElement.header ? 
      tableElement.header.rows.reduce((sum, row) => sum + this.calculateRowHeight(row, {}), 0) : 0;
    const tableFooterHeightPx = tableElement.footer ? 
      tableElement.footer.rows.reduce((sum, row) => sum + this.calculateRowHeight(row, this.data), 0) : 0;

    while (currentRowIndex < tableData.length || currentPageNumber === 1) {
      const currentPageElements: PrintElement[] = [];
      
      // 1. 只有第一页渲染页眉元素
      if (currentPageNumber === 1) {
        currentPageElements.push(...headerElements);
      }

      // 2. 计算表格起始位置
      // 第一页从原定 y 开始，后续页面从 0 开始
      let tableYPx = currentPageNumber === 1 ? UnitConverter.mmToPx(tableElement.y) : 0;
      let availableHeightPx = pageInnerHeightPx - tableYPx;
      
      // 3. 预留固定表尾空间
      if (tableElement.footer?.position === 'fixed') {
        availableHeightPx -= tableFooterHeightPx;
      }
      
      // 4. 预留页码等固定元素空间（如果有）
      otherElements.forEach((el: any) => {
        if (el.y > tableElement.y) {
          // 简化处理：如果元素在表格下方，预留其高度空间
          // 实际应更精确计算，这里暂不处理
        }
      });

      const shouldShowHeader = tableElement.header && (
        tableElement.header.repeat === 'all' || 
        (tableElement.header.repeat === 'first' && currentPageNumber === 1)
      );

      const pageTableRows: any[] = [];
      let currentTableHeightPx = shouldShowHeader ? tableHeaderHeightPx : 0;

      while (currentRowIndex < tableData.length) {
        const rowData = tableData[currentRowIndex];
        const rowHeightPx = this.calculateRowHeight(tableElement.body.rowTemplate, rowData);
        
        if (currentTableHeightPx + rowHeightPx > availableHeightPx) {
          if (pageTableRows.length > 0) {
            break; 
          } else {
            pageTableRows.push(rowData);
            currentRowIndex++;
            break;
          }
        }
        
        pageTableRows.push(rowData);
        currentTableHeightPx += rowHeightPx;
        currentRowIndex++;
      }

      const pageTableElement: TableElement = {
        ...tableElement,
        y: UnitConverter.pxToMm(tableYPx),
        body: {
          ...tableElement.body,
          dataKey: `_page_data`
        }
      };
      currentPageElements.push(pageTableElement);

      const isLastPage = currentRowIndex >= tableData.length;

      // 5. 只有最后一页渲染表尾元素（如果配置为固定位置）
      if (isLastPage) {
        currentPageElements.push(...footerElements);
      }
      
      // 6. 每一页都渲染页码等 pageInfo 元素
      currentPageElements.push(...otherElements);

      pages.push({
        pageNumber: currentPageNumber,
        totalPages: 0,
        elements: currentPageElements,
        paperConfig: paper,
        pageData: {
          _page_data: pageTableRows
        }
      });

      if (isLastPage) break;
      currentPageNumber++;
    }

    pages.forEach(page => page.totalPages = pages.length);
    return pages;
  }
}
