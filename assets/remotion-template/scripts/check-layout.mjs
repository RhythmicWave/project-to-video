#!/usr/bin/env node

import fs from 'node:fs';

const manifestPath = process.argv[2];
if (!manifestPath || process.argv.includes('--help')) {
  console.log('Usage: node check-layout.mjs <manifest.json> [--json]');
  process.exit(manifestPath ? 0 : 2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const errors = [];
const tolerance = 2.5;
const routeTolerance = 0.001;
const minRouteSegment = 4;

const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const boxValid = (box) => box && [box.x, box.y, box.width, box.height].every(finite) && box.width > 0 && box.height > 0;
const contains = (outer, inner) => inner.x >= outer.x - tolerance && inner.y >= outer.y - tolerance &&
  inner.x + inner.width <= outer.x + outer.width + tolerance && inner.y + inner.height <= outer.y + outer.height + tolerance;
const overlap = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
const pointDistance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const port = (box, side, fraction = 0.5) => {
  const f = Math.max(0, Math.min(1, fraction));
  if (side === 'left') return [box.x, box.y + box.height * f];
  if (side === 'right') return [box.x + box.width, box.y + box.height * f];
  if (side === 'top') return [box.x + box.width * f, box.y];
  if (side === 'bottom') return [box.x + box.width * f, box.y + box.height];
  throw new Error(`unknown port side: ${side}`);
};

const charWidth = (char, fontSize) => /[\u2e80-\uffff]/.test(char) ? fontSize : fontSize * (char === ' ' ? 0.35 : 0.56);
const estimateLines = (text, width, fontSize) => {
  let lines = 1;
  let used = 0;
  for (const char of text) {
    if (char === '\n') {
      lines += 1;
      used = 0;
      continue;
    }
    const next = charWidth(char, fontSize);
    if (used > 0 && used + next > width) {
      lines += 1;
      used = next;
    } else {
      used += next;
    }
  }
  return lines;
};

const segmentIntersectsRect = (a, b, rect) => {
  let t0 = 0;
  let t1 = 1;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const checks = [
    [-dx, a[0] - rect.x],
    [dx, rect.x + rect.width - a[0]],
    [-dy, a[1] - rect.y],
    [dy, rect.y + rect.height - a[1]],
  ];
  for (const [p, q] of checks) {
    if (Math.abs(p) < 1e-9) {
      if (q < -tolerance) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return t0 <= t1 + 1e-9;
};

const sceneList = Array.isArray(manifest.scenes) ? manifest.scenes : [{id: 'default', ...manifest}];
const canvas = manifest.canvas;
if (!canvas || !finite(canvas.width) || !finite(canvas.height) || canvas.width <= 0 || canvas.height <= 0) {
  errors.push('canvas must define positive width and height');
}

for (const scene of sceneList) {
  const sceneId = scene.id ?? 'unnamed';
  const sceneCanvas = {x: 0, y: 0, width: canvas?.width ?? 0, height: canvas?.height ?? 0};
  const nodes = Array.isArray(scene.nodes) ? scene.nodes : [];
  const nodeById = new Map();
  for (const node of nodes) {
    if (!node?.id || nodeById.has(node.id)) {
      errors.push(`${sceneId}: node ids must be unique`);
      continue;
    }
    nodeById.set(node.id, node);
    if (!boxValid(node.bounds) || !contains(sceneCanvas, node.bounds)) {
      errors.push(`${sceneId}: node outside canvas or invalid bounds: ${node.id}`);
    }
    if (node.contentBox && (!boxValid(node.contentBox) || !contains(node.bounds, node.contentBox))) {
      errors.push(`${sceneId}: contentBox outside node: ${node.id}`);
    }
  }

  const allowedPairs = new Set((scene.allowOverlap ?? []).map((pair) => pair.slice().sort().join('|')));
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const pair = [nodes[i].id, nodes[j].id].sort().join('|');
      if (!allowedPairs.has(pair) && boxValid(nodes[i].bounds) && boxValid(nodes[j].bounds) && overlap(nodes[i].bounds, nodes[j].bounds)) {
        errors.push(`${sceneId}: nodes overlap: ${nodes[i].id} / ${nodes[j].id}`);
      }
    }
  }

  for (const block of scene.textBlocks ?? []) {
    if (!block?.id || !boxValid(block.box) || !contains(sceneCanvas, block.box)) {
      errors.push(`${sceneId}: text block outside canvas or invalid: ${block?.id ?? 'unnamed'}`);
      continue;
    }
    if (!finite(block.fontSize) || block.fontSize <= 0) {
      errors.push(`${sceneId}: invalid fontSize: ${block.id}`);
      continue;
    }
    const lineHeight = finite(block.lineHeight) ? block.lineHeight : block.fontSize * 1.25;
    const lines = estimateLines(String(block.text ?? ''), block.box.width, block.fontSize);
    const maxLines = finite(block.maxLines) ? block.maxLines : Math.floor(block.box.height / lineHeight);
    if (lines > maxLines || lines * lineHeight > block.box.height + tolerance) {
      errors.push(`${sceneId}: text does not fit: ${block.id} (${lines} lines, max ${maxLines})`);
    }
    if (manifest.canvas.safeArea) {
      const safe = manifest.canvas.safeArea;
      const safeBox = {
        x: safe.left ?? 0,
        y: safe.top ?? 0,
        width: canvas.width - (safe.left ?? 0) - (safe.right ?? 0),
        height: canvas.height - (safe.top ?? 0) - (safe.bottom ?? 0),
      };
      if (!contains(safeBox, block.box)) errors.push(`${sceneId}: text outside safe area: ${block.id}`);
    }
  }

  const routes = scene.routes ?? [];
  for (const route of routes) {
    const points = route.points;
    if (!route?.id || !Array.isArray(points) || points.length < 2 || points.some((point) => !Array.isArray(point) || point.length !== 2 || point.some((v) => !finite(v)))) {
      errors.push(`${sceneId}: invalid route: ${route?.id ?? 'unnamed'}`);
      continue;
    }
    if (points.some((point) => point[0] < -tolerance || point[1] < -tolerance || point[0] > canvas.width + tolerance || point[1] > canvas.height + tolerance)) {
      errors.push(`${sceneId}: route outside canvas: ${route.id}`);
    }
    if (route.allowDiagonal === true && typeof route.reason !== 'string') {
      errors.push(sceneId + ': route ' + route.id + ' must explain an allowed diagonal segment');
    }
    if (route.allowShortSegments === true && typeof route.reason !== 'string') {
      errors.push(sceneId + ': route ' + route.id + ' must explain an allowed short segment');
    }
    for (let i = 0; i < points.length - 1; i += 1) {
      const dx = Math.abs(points[i + 1][0] - points[i][0]);
      const dy = Math.abs(points[i + 1][1] - points[i][1]);
      const length = Math.hypot(dx, dy);
      if (length <= routeTolerance) continue;
      if (route.allowDiagonal !== true && dx > routeTolerance && dy > routeTolerance) {
        errors.push(sceneId + ': route ' + route.id + ' is not orthogonal at segment ' + i);
      }
      if (route.allowShortSegments !== true && length < minRouteSegment) {
        errors.push(sceneId + ': route ' + route.id + ' has a micro-segment at segment ' + i + ' (' + length.toFixed(2) + 'px)');
      }
    }
    const endpointIds = [];
    for (const key of ['from', 'to']) {
      const endpoint = route[key];
      if (!endpoint) continue;
      const node = nodeById.get(endpoint.node);
      if (!node) {
        errors.push(`${sceneId}: route ${route.id} references missing node ${endpoint.node}`);
        continue;
      }
      endpointIds.push(endpoint.node);
      let expected;
      try {
        expected = port(node.bounds, endpoint.side, endpoint.fraction);
      } catch {
        errors.push(`${sceneId}: route ${route.id} has invalid ${key} side`);
        continue;
      }
      const actual = key === 'from' ? points[0] : points.at(-1);
      if (pointDistance(expected, actual) > tolerance) {
        errors.push(`${sceneId}: route ${route.id} ${key} misses node port`);
      }
    }
    const exemptions = new Set([...(route.allowThrough ?? []), ...endpointIds]);
    for (const node of nodes) {
      if (exemptions.has(node.id) || !boxValid(node.bounds)) continue;
      for (let i = 0; i < points.length - 1; i += 1) {
        if (segmentIntersectsRect(points[i], points[i + 1], node.bounds)) {
          errors.push(`${sceneId}: route ${route.id} crosses node ${node.id}`);
          break;
        }
      }
    }
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ok: errors.length === 0, errors}, null, 2));
} else if (errors.length) {
  console.error(`layout-check: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const error of errors) console.error(`- ${error}`);
} else {
  const sceneCount = sceneList.length;
  const nodeCount = sceneList.reduce((sum, scene) => sum + (scene.nodes?.length ?? 0), 0);
  const routeCount = sceneList.reduce((sum, scene) => sum + (scene.routes?.length ?? 0), 0);
  const textCount = sceneList.reduce((sum, scene) => sum + (scene.textBlocks?.length ?? 0), 0);
  console.log(`layout-check: PASS (${sceneCount} scenes, ${nodeCount} nodes, ${routeCount} routes, ${textCount} text blocks)`);
}

process.exitCode = errors.length ? 1 : 0;
