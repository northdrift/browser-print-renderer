// 纸张配置
export interface PaperConfig {
  width: number; // 单位: mm
  height: number; // 单位: mm
  orientation: 'portrait' | 'landscape'; // 方向
  margins: { top: number; right: number; bottom: number; left: number; }; // 边距, mm
}

// 元素基础类型
export interface PrintElement {
  id: string;
  type: 'text' | 'image' | 'qrcode' | 'barcode' | 'line' | 'rect' | 'table' | 'pageInfo';
  x: number; // mm
  y: number; // mm
  width: number; // mm
  height: number; // mm
  dataKey?: string; // 关联数据的 key (可选)
  style?: Record<string, any>; // 样式 (可选)
}

// 文本元素
export interface TextElement extends PrintElement {
  type: 'text';
  content?: string; // 固定文本内容 (可选)
  format?: 'plain' | 'html'; // 文本格式 (可选)
}

// 图片元素
export interface ImageElement extends PrintElement {
  type: 'image';
  src?: string; // 图片源 (可选)
}

// 二维码元素
export interface QrcodeElement extends PrintElement {
  type: 'qrcode';
  value?: string; // 二维码内容 (可选)
}

// 条形码元素
export interface BarcodeElement extends PrintElement {
  type: 'barcode';
  value?: string; // 条形码内容 (可选)
}

// 线段元素
export interface LineElement extends PrintElement {
  type: 'line';
  x2: number; // 终点 x 坐标
  y2: number; // 终点 y 坐标
  lineStyle?: 'solid' | 'dashed'; // 线条样式
  lineWidth?: number; // 线条宽度
  lineColor?: string; // 线条颜色
}

// 线框元素
export interface RectElement extends PrintElement {
  type: 'rect';
  borderStyle?: 'solid' | 'dashed'; // 边框样式
  borderWidth?: number; // 边框宽度
  borderColor?: string; // 边框颜色
}

// 表格行配置
export interface TableRow {
  height: number; // mm
  heightMode: 'fixed' | 'auto'; // 固定或自适应
  cells: TableCell[];
}

// 表格单元格配置
export interface TableCell {
  width: number; // mm
  colSpan?: number;
  rowSpan?: number;
  content: PrintElement[]; // 单元格内的元素
}

// 表格元素类型
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

// 页码/总页数元素
export interface PageInfoElement extends PrintElement {
  type: 'pageInfo';
  format: string; // 例如: '第 {pageNumber} 页 / 共 {totalPages} 页'
}

// 完整的模板结构
export interface PrintTemplate {
  paper: PaperConfig;
  elements: PrintElement[];
}

// 业务数据
export interface BusinessData {
  [key: string]: any;
}

// 布局引擎计算后的单页数据结构
export interface ComputedPage {
  pageNumber: number;
  totalPages: number;
  elements: PrintElement[];
  paperConfig: PaperConfig;
}
