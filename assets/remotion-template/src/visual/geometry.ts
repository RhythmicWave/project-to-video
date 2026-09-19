export type Point = [number, number];
export type Box = {x: number; y: number; width: number; height: number};
export type Side = 'left' | 'right' | 'top' | 'bottom';

export type Insets = {top: number; right: number; bottom: number; left: number};
export type TextBlock = {
  id: string;
  box: Box;
  text: string;
  fontSize: number;
  lineHeight?: number;
  maxLines?: number;
};

export type LayoutNode = {
  id: string;
  bounds: Box;
  contentBox?: Box;
  ports?: Record<string, Point>;
};

export type RouteValidationOptions = {
  allowDiagonal?: boolean;
  minSegment?: number;
  tolerance?: number;
};

/** 返回路径中会造成视觉瑕疵的折线问题；零长度重复点会被忽略。 */
export const routeIssues = (points: Point[], {
  allowDiagonal = false,
  minSegment = 4,
  tolerance = 0.001,
}: RouteValidationOptions = {}) => {
  const issues: string[] = [];
  points.slice(1).forEach((point, index) => {
    const previous = points[index];
    const dx = Math.abs(point[0] - previous[0]);
    const dy = Math.abs(point[1] - previous[1]);
    const length = Math.hypot(dx, dy);
    if (length <= tolerance) return;
    if (!allowDiagonal && dx > tolerance && dy > tolerance) {
      issues.push(`diagonal segment at index ${index}`);
    }
    if (length < minSegment) {
      issues.push(`micro-segment at index ${index} (${length.toFixed(2)}px)`);
    }
  });
  return issues;
};

/** 供动态 SVG 场景在渲染前主动拒绝不合规路径。 */
export const assertOrthogonalRoute = (points: Point[], options: Omit<RouteValidationOptions, 'allowDiagonal'> = {}) => {
  const issues = routeIssues(points, options);
  if (issues.length) throw new Error(`Invalid orthogonal route: ${issues.join('; ')}`);
  return points;
};

/** 端口在图形边界上；标签空间由场景另外预留。 */
export const port = (box: Box, side: Side, fraction = 0.5): Point => {
  const f = Math.max(0, Math.min(1, fraction));
  if (side === 'left') return [box.x, box.y + box.height * f];
  if (side === 'right') return [box.x + box.width, box.y + box.height * f];
  if (side === 'top') return [box.x + box.width * f, box.y];
  return [box.x + box.width * f, box.y + box.height];
};

/** 将本地坐标放入包含完整内容的视口，使用等比缩放。 */
export const fitBox = (source: Box, viewport: Box) => {
  if (source.width <= 0 || source.height <= 0 || viewport.width <= 0 || viewport.height <= 0) {
    throw new Error('fitBox requires positive dimensions');
  }
  const scale = Math.min(viewport.width / source.width, viewport.height / source.height);
  return {
    scale,
    x: viewport.x + (viewport.width - source.width * scale) / 2 - source.x * scale,
    y: viewport.y + (viewport.height - source.height * scale) / 2 - source.y * scale,
  };
};

export const mapPoint = (point: Point, transform: {x: number; y: number; scale: number}): Point => [
  transform.x + point[0] * transform.scale,
  transform.y + point[1] * transform.scale,
];

/** 将面板分成标题、副标题、内容和页脚区域，避免子元素侵入标题区。 */
export const panelRegions = (
  box: Box,
  {header = 92, footer = 0, padding = 24}: {header?: number; footer?: number; padding?: number} = {},
) => {
  const contentTop = box.y + header;
  const contentBottom = box.y + box.height - footer;
  const contentHeight = Math.max(0, contentBottom - contentTop - padding * 2);
  return {
    bounds: box,
    headerBox: {x: box.x, y: box.y, width: box.width, height: header},
    subtitleBox: {x: box.x + padding, y: box.y + 48, width: Math.max(0, box.width - padding * 2), height: 28},
    contentBox: {
      x: box.x + padding,
      y: contentTop + padding,
      width: Math.max(0, box.width - padding * 2),
      height: contentHeight,
    },
    footerBox: {
      x: box.x + padding,
      y: contentBottom,
      width: Math.max(0, box.width - padding * 2),
      height: footer,
    },
  };
};

export const boxesOverlap = (a: Box, b: Box, gap = 0) =>
  a.x < b.x + b.width + gap &&
  a.x + a.width + gap > b.x &&
  a.y < b.y + b.height + gap &&
  a.y + a.height + gap > b.y;

export const boxContains = (outer: Box, inner: Box, tolerance = 0) =>
  inner.x >= outer.x - tolerance &&
  inner.y >= outer.y - tolerance &&
  inner.x + inner.width <= outer.x + outer.width + tolerance &&
  inner.y + inner.height <= outer.y + outer.height + tolerance;

/** 估算 SVG 文本在固定宽度内的换行行数；中英文混排使用保守宽度。 */
export const estimateTextLines = (text: string, maxWidth: number, fontSize: number) => {
  if (maxWidth <= 0 || fontSize <= 0) return Number.POSITIVE_INFINITY;
  let lines = 1;
  let lineWidth = 0;
  for (const char of text) {
    if (char === '\n') {
      lines += 1;
      lineWidth = 0;
      continue;
    }
    const charWidth = /[\u2e80-\uffff]/.test(char) ? fontSize : fontSize * (char === ' ' ? 0.35 : 0.56);
    if (lineWidth > 0 && lineWidth + charWidth > maxWidth) {
      lines += 1;
      lineWidth = charWidth;
    } else {
      lineWidth += charWidth;
    }
  }
  return lines;
};

export const wrapText = (text: string, maxWidth: number, fontSize: number) => {
  const lines: string[] = [];
  let line = '';
  let lineWidth = 0;
  for (const char of text) {
    if (char === '\n') {
      lines.push(line);
      line = '';
      lineWidth = 0;
      continue;
    }
    const charWidth = /[\u2e80-\uffff]/.test(char) ? fontSize : fontSize * (char === ' ' ? 0.35 : 0.56);
    if (line && lineWidth + charWidth > maxWidth) {
      lines.push(line);
      line = char;
      lineWidth = charWidth;
    } else {
      line += char;
      lineWidth += charWidth;
    }
  }
  if (line || !lines.length) lines.push(line);
  return lines;
};

export const assertWithinCanvas = (box: Box, canvas: Box, id = 'box') => {
  if (box.width <= 0 || box.height <= 0 || !boxContains(canvas, box)) {
    throw new Error(`${id} is outside canvas or has non-positive dimensions`);
  }
};

export const assertNoOverlap = (nodes: LayoutNode[], gap = 0) => {
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      if (boxesOverlap(nodes[i].bounds, nodes[j].bounds, gap)) {
        throw new Error(`layout nodes overlap: ${nodes[i].id} / ${nodes[j].id}`);
      }
    }
  }
};

export const assertTextFits = (block: TextBlock) => {
  const lines = estimateTextLines(block.text, block.box.width, block.fontSize);
  const lineHeight = block.lineHeight ?? block.fontSize * 1.25;
  const maxLines = block.maxLines ?? Math.floor(block.box.height / lineHeight);
  if (lines > maxLines || lines * lineHeight > block.box.height + 0.01) {
    throw new Error(`text block does not fit: ${block.id}`);
  }
};

const samePoint = (a: Point, b: Point, tolerance = 1.5) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= tolerance;

export const assertRouteEndpoints = (points: Point[], from: Point, to: Point, id = 'route') => {
  if (points.length < 2 || !samePoint(points[0], from) || !samePoint(points[points.length - 1], to)) {
    throw new Error(`route endpoints do not match: ${id}`);
  }
};

const pointInside = (point: Point, box: Box, tolerance = 0) =>
  point[0] >= box.x - tolerance &&
  point[0] <= box.x + box.width + tolerance &&
  point[1] >= box.y - tolerance &&
  point[1] <= box.y + box.height + tolerance;

/** 检查折线路段是否穿过不应被线路覆盖的节点。 */
export const assertNoRouteCrossing = (points: Point[], obstacles: LayoutNode[], exemptIds: string[] = [], id = 'route') => {
  for (const obstacle of obstacles) {
    if (exemptIds.includes(obstacle.id)) continue;
    for (let i = 0; i < points.length - 1; i += 1) {
      const [a, b] = [points[i], points[i + 1]];
      const minX = Math.min(a[0], b[0]);
      const maxX = Math.max(a[0], b[0]);
      const minY = Math.min(a[1], b[1]);
      const maxY = Math.max(a[1], b[1]);
      if (maxX >= obstacle.bounds.x && minX <= obstacle.bounds.x + obstacle.bounds.width &&
          maxY >= obstacle.bounds.y && minY <= obstacle.bounds.y + obstacle.bounds.height &&
          (pointInside(a, obstacle.bounds) || pointInside(b, obstacle.bounds) ||
            (a[0] === b[0] && a[0] >= obstacle.bounds.x && a[0] <= obstacle.bounds.x + obstacle.bounds.width) ||
            (a[1] === b[1] && a[1] >= obstacle.bounds.y && a[1] <= obstacle.bounds.y + obstacle.bounds.height))) {
        throw new Error(`route crosses node ${obstacle.id}: ${id}`);
      }
    }
  }
};

const removeConsecutiveDuplicates = (points: Point[]) => points.filter((point, index) => index === 0 || !samePoint(point, points[index - 1], 0));

/** 生成可读的正交折线；channelY/channelX 用于给反馈线预留专用通道。 */
export const routeOrthogonal = ({
  fromBox,
  fromSide,
  fromFraction = 0.5,
  toBox,
  toSide,
  toFraction = 0.5,
  channelY,
  channelX,
  gap = 24,
}: {
  fromBox: Box;
  fromSide: Side;
  fromFraction?: number;
  toBox: Box;
  toSide: Side;
  toFraction?: number;
  channelY?: number;
  channelX?: number;
  gap?: number;
}): Point[] => {
  const from = port(fromBox, fromSide, fromFraction);
  const to = port(toBox, toSide, toFraction);
  if (channelY !== undefined) {
    return removeConsecutiveDuplicates([from, [from[0], channelY], [to[0], channelY], to]);
  }
  if (channelX !== undefined) {
    return removeConsecutiveDuplicates([from, [channelX, from[1]], [channelX, to[1]], to]);
  }
  if ((fromSide === 'right' && toSide === 'left') || (fromSide === 'left' && toSide === 'right')) {
    const midX = (from[0] + to[0]) / 2;
    return removeConsecutiveDuplicates([from, [midX, from[1]], [midX, to[1]], to]);
  }
  if ((fromSide === 'top' && toSide === 'bottom') || (fromSide === 'bottom' && toSide === 'top')) {
    const midY = (from[1] + to[1]) / 2;
    return removeConsecutiveDuplicates([from, [from[0], midY], [to[0], midY], to]);
  }
  const outward = fromSide === 'left' || fromSide === 'right' ? gap : -gap;
  const outwardFrom: Point = fromSide === 'left' || fromSide === 'right' ? [from[0] + (fromSide === 'right' ? outward : -outward), from[1]] : [from[0], from[1] + (fromSide === 'bottom' ? outward : -outward)];
  return removeConsecutiveDuplicates([from, outwardFrom, [outwardFrom[0], to[1]], to]);
};
