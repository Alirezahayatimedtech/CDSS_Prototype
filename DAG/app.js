const structuredKindStyles = {
  default: { fill: "#f8fafc", stroke: "#334155" },
  exposure: { fill: "#cffafe", stroke: "#0f766e" },
  latent: { fill: "#fee2e2", stroke: "#b91c1c" },
  outcome: { fill: "#fef3c7", stroke: "#a16207" },
};

const paperKindStyles = {
  default: { fill: "#47b9e7", stroke: "#2b95be", text: "#0f172a" },
  exposure: { fill: "#d9ea45", stroke: "#8e9e22", text: "#0f172a" },
  latent: { fill: "#e5e7eb", stroke: "#9ca3af", text: "#0f172a" },
  outcome: { fill: "#47b9e7", stroke: "#2b95be", text: "#0f172a" },
};

const doc = typeof document !== "undefined" ? document : null;
const riskList = doc?.getElementById("riskList");
const graphCanvas = doc?.getElementById("graphCanvas");
const graphCountPill = doc?.getElementById("graphCountPill");
const graphTitle = doc?.getElementById("graphTitle");
const graphSubtitle = doc?.getElementById("graphSubtitle");
const riskSearch = doc?.getElementById("riskSearch");
const nodeSearch = doc?.getElementById("nodeSearch");
const clearNodeSelection = doc?.getElementById("clearNodeSelection");
const layoutMode = doc?.getElementById("layoutMode");
const zoomOut = doc?.getElementById("zoomOut");
const zoomReset = doc?.getElementById("zoomReset");
const zoomIn = doc?.getElementById("zoomIn");
const zoomStatus = doc?.getElementById("zoomStatus");

const nodeCount = doc?.getElementById("nodeCount");
const edgeCount = doc?.getElementById("edgeCount");
const componentCount = doc?.getElementById("componentCount");
const warningCount = doc?.getElementById("warningCount");
const selectedNodeTitle = doc?.getElementById("selectedNodeTitle");
const selectedNodeKind = doc?.getElementById("selectedNodeKind");
const incomingList = doc?.getElementById("incomingList");
const outgoingList = doc?.getElementById("outgoingList");
const warningList = doc?.getElementById("warningList");
const rootList = doc?.getElementById("rootList");
const sinkList = doc?.getElementById("sinkList");
const legendList = doc?.getElementById("legendList");

let catalog = null;
let currentGraph = null;
let selectedNodeId = null;
let currentNodeSearch = "";
let currentRiskSearch = "";
let currentLayoutMode = "paper";
let currentZoom = 1;

function listMarkup(items) {
  if (!items.length) {
    return "<li>None</li>";
  }
  return items.map((item) => `<li>${item}</li>`).join("");
}

function wrapLabel(label, width = 18) {
  const words = label.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= width) {
      line = candidate;
    } else {
      if (line) {
        lines.push(line);
      }
      line = word;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

function measureNode(label, nodeCount = 0) {
  const denseGraph = nodeCount >= 45;
  const veryDenseGraph = nodeCount >= 55;
  const wrapWidth = veryDenseGraph ? 14 : denseGraph ? 16 : 18;
  const fontSize = veryDenseGraph ? 11.2 : denseGraph ? 11.8 : 12.5;
  const lineHeight = veryDenseGraph ? 14 : 15;
  const minWidth = veryDenseGraph ? 106 : 116;
  const maxWidth = veryDenseGraph ? 190 : denseGraph ? 208 : 226;
  const horizontalPadding = veryDenseGraph ? 18 : 20;
  const verticalPadding = veryDenseGraph ? 14 : 15;
  const lines = wrapLabel(label, wrapWidth);
  const longest = Math.max(...lines.map((line) => line.length));
  return {
    width: Math.max(minWidth, Math.min(maxWidth, longest * fontSize * 0.62 + horizontalPadding * 2)),
    height: verticalPadding * 2 + lines.length * lineHeight,
    fontSize,
    lineHeight,
    lines,
  };
}

function measurePaperLabel(label, nodeCount = 0) {
  const denseGraph = nodeCount >= 45;
  const veryDenseGraph = nodeCount >= 55;
  const wrapWidth = veryDenseGraph ? 14 : denseGraph ? 16 : 18;
  const fontSize = veryDenseGraph ? 10.5 : denseGraph ? 11 : 11.5;
  const lineHeight = veryDenseGraph ? 12 : 13;
  const lines = wrapLabel(label, wrapWidth);
  const longest = Math.max(...lines.map((line) => line.length));
  return {
    width: Math.max(56, longest * fontSize * 0.56),
    height: Math.max(lineHeight, lines.length * lineHeight),
    fontSize,
    lineHeight,
    lines,
  };
}

function rectEdgePoint(centerX, centerY, width, height, towardX, towardY) {
  const dx = towardX - centerX;
  const dy = towardY - centerY;
  if (dx === 0 && dy === 0) {
    return { x: centerX, y: centerY };
  }
  const halfW = width / 2;
  const halfH = height / 2;
  const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : halfW / Math.abs(dx);
  const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : halfH / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);
  return { x: centerX + dx * scale, y: centerY + dy * scale };
}

function circleEdgePoint(centerX, centerY, radius, towardX, towardY) {
  const dx = towardX - centerX;
  const dy = towardY - centerY;
  const distance = Math.hypot(dx, dy);

  if (!distance) {
    return { x: centerX, y: centerY };
  }

  const scale = radius / distance;
  return { x: centerX + dx * scale, y: centerY + dy * scale };
}

function intersectsBox(left, top, width, height, other, padding = 0) {
  return !(
    left + width + padding <= other.left ||
    left - padding >= other.right ||
    top + height + padding <= other.top ||
    top - padding >= other.bottom
  );
}

function graphNodeMap(graph) {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

function buildAdjacency(graph) {
  const incoming = new Map(graph.nodes.map((node) => [node.id, []]));
  const outgoing = new Map(graph.nodes.map((node) => [node.id, []]));

  for (const edge of graph.edges) {
    incoming.get(edge.target)?.push(edge.source);
    outgoing.get(edge.source)?.push(edge.target);
  }

  return { incoming, outgoing };
}

function buildTopologicalOrder(graph, incoming, outgoing) {
  const indegree = new Map(graph.nodes.map((node) => [node.id, incoming.get(node.id)?.length ?? 0]));
  const queue = graph.nodes
    .map((node) => node.id)
    .filter((nodeId) => (indegree.get(nodeId) ?? 0) === 0)
    .sort((left, right) => left.localeCompare(right));
  const order = [];

  while (queue.length) {
    const nodeId = queue.shift();
    order.push(nodeId);
    for (const target of outgoing.get(nodeId) ?? []) {
      indegree.set(target, (indegree.get(target) ?? 0) - 1);
      if ((indegree.get(target) ?? 0) === 0) {
        queue.push(target);
        queue.sort((left, right) => left.localeCompare(right));
      }
    }
  }

  const hadCycle = order.length !== graph.nodes.length;
  if (hadCycle) {
    const remainder = graph.nodes
      .map((node) => node.id)
      .filter((nodeId) => !order.includes(nodeId))
      .sort((left, right) => left.localeCompare(right));
    order.push(...remainder);
  }

  return { order, hadCycle };
}

function sortLayerByBarycenter(nodeIds, neighborLookup, referenceOrder, fallbackOrder) {
  return [...nodeIds].sort((left, right) => {
    const leftNeighbors = (neighborLookup.get(left) ?? [])
      .map((neighbor) => referenceOrder.get(neighbor))
      .filter((value) => Number.isFinite(value));
    const rightNeighbors = (neighborLookup.get(right) ?? [])
      .map((neighbor) => referenceOrder.get(neighbor))
      .filter((value) => Number.isFinite(value));

    const leftScore = leftNeighbors.length
      ? leftNeighbors.reduce((sum, value) => sum + value, 0) / leftNeighbors.length
      : Number.POSITIVE_INFINITY;
    const rightScore = rightNeighbors.length
      ? rightNeighbors.reduce((sum, value) => sum + value, 0) / rightNeighbors.length
      : Number.POSITIVE_INFINITY;

    if (Number.isFinite(leftScore) && Number.isFinite(rightScore) && leftScore !== rightScore) {
      return leftScore - rightScore;
    }
    if (Number.isFinite(leftScore) !== Number.isFinite(rightScore)) {
      return Number.isFinite(leftScore) ? -1 : 1;
    }
    return (fallbackOrder.get(left) ?? 0) - (fallbackOrder.get(right) ?? 0);
  });
}

function computeStructuredGraphLayout(graph) {
  const measured = new Map(graph.nodes.map((node) => [node.id, measureNode(node.id, graph.nodes.length)]));
  const { incoming, outgoing } = buildAdjacency(graph);
  const { order } = buildTopologicalOrder(graph, incoming, outgoing);
  const fallbackOrder = new Map(order.map((nodeId, index) => [nodeId, index]));
  const layers = new Map();
  const nodeLayer = new Map();

  for (const nodeId of order) {
    const parentLayers = (incoming.get(nodeId) ?? [])
      .map((parentId) => nodeLayer.get(parentId))
      .filter((value) => Number.isFinite(value));
    const layer = parentLayers.length ? Math.max(...parentLayers) + 1 : 0;
    nodeLayer.set(nodeId, layer);
    if (!layers.has(layer)) {
      layers.set(layer, []);
    }
    layers.get(layer).push(nodeId);
  }

  const orderedLayers = Array.from(layers.keys())
    .sort((left, right) => left - right)
    .map((layer) => [...layers.get(layer)]);

  let layerOrder = new Map();
  for (const layer of orderedLayers) {
    layer.sort((left, right) => (fallbackOrder.get(left) ?? 0) - (fallbackOrder.get(right) ?? 0));
    layer.forEach((nodeId, index) => layerOrder.set(nodeId, index));
  }

  for (let pass = 0; pass < 4; pass += 1) {
    for (let index = 1; index < orderedLayers.length; index += 1) {
      orderedLayers[index] = sortLayerByBarycenter(
        orderedLayers[index],
        incoming,
        layerOrder,
        fallbackOrder
      );
      orderedLayers[index].forEach((nodeId, position) => layerOrder.set(nodeId, position));
    }

    for (let index = orderedLayers.length - 2; index >= 0; index -= 1) {
      orderedLayers[index] = sortLayerByBarycenter(
        orderedLayers[index],
        outgoing,
        layerOrder,
        fallbackOrder
      );
      orderedLayers[index].forEach((nodeId, position) => layerOrder.set(nodeId, position));
    }
  }

  const horizontalGap = graph.nodes.length >= 45 ? 76 : 88;
  const verticalGap = graph.nodes.length >= 45 ? 24 : 28;
  const paddingX = 72;
  const paddingY = 72;
  const layerWidths = orderedLayers.map((layer) =>
    Math.max(...layer.map((nodeId) => measured.get(nodeId).width))
  );
  const layerHeights = orderedLayers.map((layer) =>
    layer.reduce((sum, nodeId) => sum + measured.get(nodeId).height, 0) + verticalGap * Math.max(0, layer.length - 1)
  );
  const maxLayerHeight = Math.max(...layerHeights, 0);
  const coords = new Map();

  let cursorX = paddingX;
  orderedLayers.forEach((layer, index) => {
    const layerWidth = layerWidths[index];
    const layerHeight = layerHeights[index];
    const centerX = cursorX + layerWidth / 2;
    let cursorY = paddingY + (maxLayerHeight - layerHeight) / 2;

    layer.forEach((nodeId) => {
      const box = measured.get(nodeId);
      coords.set(nodeId, {
        cx: centerX,
        cy: cursorY + box.height / 2,
        ...box,
      });
      cursorY += box.height + verticalGap;
    });

    cursorX += layerWidth + horizontalGap;
  });

  return {
    coords,
    width: Math.round(
      paddingX * 2 +
        layerWidths.reduce((sum, value) => sum + value, 0) +
        horizontalGap * Math.max(0, orderedLayers.length - 1)
    ),
    height: Math.round(paddingY * 2 + maxLayerHeight),
  };
}

function buildPaperLabelCandidates(entry, centerX, centerY) {
  const gap = entry.radius + 8;
  const horizontalBias = entry.cx <= centerX ? "left" : "right";
  const verticalBias = entry.cy <= centerY ? "above" : "below";
  const preference = [
    horizontalBias,
    verticalBias,
    horizontalBias === "left" ? "right" : "left",
    verticalBias === "above" ? "below" : "above",
    "above-left",
    "above-right",
    "below-left",
    "below-right",
  ];

  const placements = {
    left: {
      left: entry.cx - gap - entry.labelWidth,
      top: entry.cy - entry.labelHeight / 2,
    },
    right: {
      left: entry.cx + gap,
      top: entry.cy - entry.labelHeight / 2,
    },
    above: {
      left: entry.cx - entry.labelWidth / 2,
      top: entry.cy - gap - entry.labelHeight,
    },
    below: {
      left: entry.cx - entry.labelWidth / 2,
      top: entry.cy + gap,
    },
    "above-left": {
      left: entry.cx - gap - entry.labelWidth,
      top: entry.cy - gap - entry.labelHeight,
    },
    "above-right": {
      left: entry.cx + gap,
      top: entry.cy - gap - entry.labelHeight,
    },
    "below-left": {
      left: entry.cx - gap - entry.labelWidth,
      top: entry.cy + gap,
    },
    "below-right": {
      left: entry.cx + gap,
      top: entry.cy + gap,
    },
  };

  return preference.map((direction, index) => ({
    direction,
    rank: index,
    left: placements[direction].left,
    top: placements[direction].top,
  }));
}

function assignPaperLabelPlacements(graph, coords, bounds) {
  const { incoming, outgoing } = buildAdjacency(graph);
  const circleBoxes = new Map(
    graph.nodes.map((node) => {
      const entry = coords.get(node.id);
      return [
        node.id,
        {
          left: entry.cx - entry.radius,
          right: entry.cx + entry.radius,
          top: entry.cy - entry.radius,
          bottom: entry.cy + entry.radius,
        },
      ];
    })
  );

  const centerX = graph.nodes.reduce((sum, node) => sum + coords.get(node.id).cx, 0) / graph.nodes.length;
  const centerY = graph.nodes.reduce((sum, node) => sum + coords.get(node.id).cy, 0) / graph.nodes.length;
  const placedLabels = [];
  const nodeOrder = [...graph.nodes].sort((left, right) => {
    const leftDegree = (incoming.get(left.id)?.length ?? 0) + (outgoing.get(left.id)?.length ?? 0);
    const rightDegree = (incoming.get(right.id)?.length ?? 0) + (outgoing.get(right.id)?.length ?? 0);

    if (leftDegree !== rightDegree) {
      return rightDegree - leftDegree;
    }

    const leftDistance = Math.hypot(coords.get(left.id).cx - centerX, coords.get(left.id).cy - centerY);
    const rightDistance = Math.hypot(coords.get(right.id).cx - centerX, coords.get(right.id).cy - centerY);
    return leftDistance - rightDistance;
  });

  for (const node of nodeOrder) {
    const entry = coords.get(node.id);
    const candidates = buildPaperLabelCandidates(entry, centerX, centerY)
      .map((candidate) => {
        let score = candidate.rank * 12;
        const outsideX = Math.max(0, bounds.left - candidate.left) + Math.max(0, candidate.left + entry.labelWidth - bounds.right);
        const outsideY = Math.max(0, bounds.top - candidate.top) + Math.max(0, candidate.top + entry.labelHeight - bounds.bottom);

        score += (outsideX + outsideY) * 4;

        for (const [otherId, box] of circleBoxes.entries()) {
          if (otherId === node.id) continue;
          if (intersectsBox(candidate.left, candidate.top, entry.labelWidth, entry.labelHeight, box, 4)) {
            score += 800;
          }
        }

        for (const box of placedLabels) {
          if (intersectsBox(candidate.left, candidate.top, entry.labelWidth, entry.labelHeight, box, 6)) {
            score += 1200;
          }
        }

        return { ...candidate, score };
      })
      .sort((left, right) => left.score - right.score);

    const chosen = candidates[0];
    entry.labelLeft = chosen.left;
    entry.labelTop = chosen.top;
    placedLabels.push({
      left: chosen.left,
      right: chosen.left + entry.labelWidth,
      top: chosen.top,
      bottom: chosen.top + entry.labelHeight,
    });
  }
}

function shiftPaperLayout(coords, deltaX, deltaY) {
  coords.forEach((entry) => {
    entry.cx += deltaX;
    entry.cy += deltaY;
    if (Number.isFinite(entry.labelLeft)) {
      entry.labelLeft += deltaX;
    }
    if (Number.isFinite(entry.labelTop)) {
      entry.labelTop += deltaY;
    }
  });
}

function computePaperGraphLayout(graph) {
  const positionedNodes = graph.nodes.filter(
    (node) => Number.isFinite(node.x) && Number.isFinite(node.y)
  );

  if (positionedNodes.length !== graph.nodes.length) {
    return computeStructuredGraphLayout(graph);
  }

  const xValues = positionedNodes.map((node) => node.x);
  const yValues = positionedNodes.map((node) => node.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const xRange = Math.max(maxX - minX, 0.001);
  const yRange = Math.max(maxY - minY, 0.001);
  const targetMaxSpan = graph.nodes.length >= 45 ? 900 : 760;
  const scale = targetMaxSpan / Math.max(xRange, yRange);
  const paddingX = 96;
  const paddingY = 96;
  const radius = graph.nodes.length >= 45 ? 11 : 12.5;
  const coords = new Map();

  graph.nodes.forEach((node) => {
    const label = measurePaperLabel(node.id, graph.nodes.length);
    coords.set(node.id, {
      cx: (node.x - minX) * scale,
      cy: (maxY - node.y) * scale,
      radius,
      labelWidth: label.width,
      labelHeight: label.height,
      fontSize: label.fontSize,
      lineHeight: label.lineHeight,
      lines: label.lines,
    });
  });

  const nodeValues = [...coords.values()];
  shiftPaperLayout(
    coords,
    paddingX - Math.min(...nodeValues.map((entry) => entry.cx - entry.radius)),
    paddingY - Math.min(...nodeValues.map((entry) => entry.cy - entry.radius))
  );

  const shiftedNodeValues = [...coords.values()];
  const nodeBounds = {
    left: paddingX * 0.35,
    top: paddingY * 0.35,
    right: Math.max(...shiftedNodeValues.map((entry) => entry.cx + entry.radius)) + paddingX,
    bottom: Math.max(...shiftedNodeValues.map((entry) => entry.cy + entry.radius)) + paddingY,
  };

  assignPaperLabelPlacements(graph, coords, nodeBounds);

  const allLeft = Math.min(
    ...[...coords.values()].flatMap((entry) => [entry.cx - entry.radius, entry.labelLeft])
  );
  const allTop = Math.min(
    ...[...coords.values()].flatMap((entry) => [entry.cy - entry.radius, entry.labelTop])
  );
  shiftPaperLayout(coords, paddingX - allLeft, paddingY - allTop);

  const allValues = [...coords.values()];
  const width = Math.round(
    Math.max(
      ...allValues.flatMap((entry) => [entry.cx + entry.radius, entry.labelLeft + entry.labelWidth])
    ) + paddingX
  );
  const height = Math.round(
    Math.max(
      ...allValues.flatMap((entry) => [entry.cy + entry.radius, entry.labelTop + entry.labelHeight])
    ) + paddingY
  );

  return { coords, width, height };
}

function computeGraphLayout(graph) {
  if (currentLayoutMode === "structured") {
    return computeStructuredGraphLayout(graph);
  }
  return computePaperGraphLayout(graph);
}

function clampZoom(value) {
  return Math.max(0.5, Math.min(2.5, value));
}

function updateZoomStatus() {
  if (zoomStatus) {
    zoomStatus.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

function renderLegend() {
  if (!legendList) {
    return;
  }

  const legendItems =
    currentLayoutMode === "structured"
      ? [
          { label: "Operational / clinical", color: structuredKindStyles.default.fill, border: structuredKindStyles.default.stroke, shape: "rect" },
          { label: "Exposure", color: structuredKindStyles.exposure.fill, border: structuredKindStyles.exposure.stroke, shape: "rect" },
          { label: "Latent / linked risk", color: structuredKindStyles.latent.fill, border: structuredKindStyles.latent.stroke, shape: "rect" },
          { label: "Outcome", color: structuredKindStyles.outcome.fill, border: structuredKindStyles.outcome.stroke, shape: "rect" },
          { label: "Directed edge", color: "#64748b", border: "#64748b", shape: "line" },
        ]
      : [
          { label: "Operational / clinical", color: paperKindStyles.default.fill, border: paperKindStyles.default.stroke, shape: "circle" },
          { label: "Exposure", color: paperKindStyles.exposure.fill, border: paperKindStyles.exposure.stroke, shape: "circle" },
          { label: "Latent / linked risk", color: paperKindStyles.latent.fill, border: paperKindStyles.latent.stroke, shape: "circle" },
          { label: "Outcome", color: paperKindStyles.outcome.fill, border: paperKindStyles.outcome.stroke, shape: "circle" },
          { label: "Directed edge", color: "#8ccf69", border: "#8ccf69", shape: "line" },
        ];

  legendList.innerHTML = legendItems
    .map((item) => {
      if (item.shape === "line") {
        return `<div class="legend-item"><span class="legend-swatch legend-line" style="--legend-color:${item.color};"></span><span>${item.label}</span></div>`;
      }

      return `<div class="legend-item"><span class="legend-swatch legend-${item.shape}" style="--legend-color:${item.color}; --legend-border:${item.border};"></span><span>${item.label}</span></div>`;
    })
    .join("");
}

function renderRiskList() {
  riskList.innerHTML = "";
  for (const graph of catalog.graphs) {
    const visible =
      !currentRiskSearch || graph.title.toLowerCase().includes(currentRiskSearch);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `risk-button${graph.slug === currentGraph.slug ? " active" : ""}${visible ? "" : " hidden"}`;
    button.innerHTML = `${graph.title}<small>${graph.validation.nodeCount} nodes | ${graph.validation.edgeCount} edges</small>`;
    button.addEventListener("click", () => {
      selectedNodeId = null;
      currentNodeSearch = "";
      nodeSearch.value = "";
      currentGraph = graph;
      renderRiskList();
      renderGraph();
      updateInspector();
    });
    riskList.appendChild(button);
  }
}

function renderStructuredGraphMarkup(graph, coords) {
  const edgesMarkup = graph.edges
    .map((edge) => {
      const source = coords.get(edge.source);
      const target = coords.get(edge.target);
      const start = rectEdgePoint(source.cx, source.cy, source.width, source.height, target.cx, target.cy);
      const end = rectEdgePoint(target.cx, target.cy, target.width, target.height, source.cx, source.cy);
      return `<line class="edge-line structured-edge" data-source="${edge.source}" data-target="${edge.target}" x1="${start.x.toFixed(
        1
      )}" y1="${start.y.toFixed(1)}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(
        1
      )}" stroke="#64748b" stroke-width="1.4" marker-end="url(#arrow-structured)"><title>${edge.source} -> ${edge.target}</title></line>`;
    })
    .join("");

  const nodesMarkup = graph.nodes
    .map((node) => {
      const style = structuredKindStyles[node.kind];
      const box = coords.get(node.id);
      const x = box.cx - box.width / 2;
      const y = box.cy - box.height / 2;
      const textY = box.cy - ((box.lines.length - 1) * box.lineHeight) / 2;
      const tspanMarkup = box.lines
        .map(
          (line, index) =>
            `<tspan x="${box.cx.toFixed(1)}" dy="${index === 0 ? 0 : box.lineHeight}">${line}</tspan>`
        )
        .join("");

      return `<g class="node-group" data-node="${node.id}">
        <rect class="node-shape node-rect" data-node="${node.id}" x="${x.toFixed(1)}" y="${y.toFixed(
          1
        )}" width="${box.width.toFixed(1)}" height="${box.height.toFixed(
          1
        )}" rx="14" ry="14" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.7"></rect>
        <text class="node-label structured-label" data-node="${node.id}" x="${box.cx.toFixed(
          1
        )}" y="${textY.toFixed(
          1
        )}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${box.fontSize}" font-weight="600" fill="#0f172a">${tspanMarkup}</text>
        <title>${node.id}</title>
      </g>`;
    })
    .join("");

  return { edgesMarkup, nodesMarkup };
}

function renderPaperGraphMarkup(graph, coords) {
  const edgesMarkup = graph.edges
    .map((edge) => {
      const source = coords.get(edge.source);
      const target = coords.get(edge.target);
      const start = circleEdgePoint(source.cx, source.cy, source.radius, target.cx, target.cy);
      const end = circleEdgePoint(target.cx, target.cy, target.radius, source.cx, source.cy);
      return `<line class="edge-line paper-edge" data-source="${edge.source}" data-target="${edge.target}" x1="${start.x.toFixed(
        1
      )}" y1="${start.y.toFixed(1)}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(
        1
      )}" stroke="#8ccf69" stroke-width="1.5" marker-end="url(#arrow-paper)"><title>${edge.source} -> ${edge.target}</title></line>`;
    })
    .join("");

  const nodesMarkup = graph.nodes
    .map((node) => {
      const style = paperKindStyles[node.kind] ?? paperKindStyles.default;
      const entry = coords.get(node.id);
      const tspanMarkup = entry.lines
        .map(
          (line, index) =>
            `<tspan x="${entry.labelLeft.toFixed(1)}" dy="${index === 0 ? 0 : entry.lineHeight}">${line}</tspan>`
        )
        .join("");

      return `<g class="node-group" data-node="${node.id}">
        <circle class="node-shape node-circle" data-node="${node.id}" cx="${entry.cx.toFixed(
          1
        )}" cy="${entry.cy.toFixed(1)}" r="${entry.radius.toFixed(1)}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5"></circle>
        <text class="node-label paper-label" data-node="${node.id}" x="${entry.labelLeft.toFixed(
          1
        )}" y="${entry.labelTop.toFixed(
          1
        )}" dominant-baseline="hanging" text-anchor="start" font-family="Segoe UI, Arial, sans-serif" font-size="${entry.fontSize}" font-weight="600" fill="${style.text}">${tspanMarkup}</text>
        <title>${node.id}</title>
      </g>`;
    })
    .join("");

  return { edgesMarkup, nodesMarkup };
}

function renderGraph() {
  graphTitle.textContent = currentGraph.title;
  graphSubtitle.textContent = currentGraph.validation.warnings.length
    ? currentGraph.validation.warnings.join(" | ")
    : "Validation clean: no missing references or duplicate edges detected.";

  nodeCount.textContent = String(currentGraph.validation.nodeCount);
  edgeCount.textContent = String(currentGraph.validation.edgeCount);
  componentCount.textContent = String(currentGraph.validation.components);
  warningCount.textContent = String(currentGraph.validation.warnings.length);
  warningList.innerHTML = listMarkup(currentGraph.validation.warnings);
  rootList.innerHTML = listMarkup(currentGraph.validation.roots);
  sinkList.innerHTML = listMarkup(currentGraph.validation.sinks);

  const nodeMap = graphNodeMap(currentGraph);
  const { coords, width, height } = computeGraphLayout(currentGraph);
  const markup =
    currentLayoutMode === "structured"
      ? renderStructuredGraphMarkup(currentGraph, coords)
      : renderPaperGraphMarkup(currentGraph, coords);
  const backgroundFill = currentLayoutMode === "structured" ? "url(#bg)" : "#ffffff";
  const zoomedWidth = Math.round(width * currentZoom);
  const zoomedHeight = Math.round(height * currentZoom);

  graphCanvas.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${zoomedWidth}" height="${zoomedHeight}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <marker id="arrow-structured" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
        </marker>
        <marker id="arrow-paper" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#8ccf69" />
        </marker>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundFill}" />
      ${markup.edgesMarkup}
      ${markup.nodesMarkup}
    </svg>`;

  renderLegend();
  updateZoomStatus();
  bindGraphEvents(nodeMap);
  applyFilters(nodeMap);
}

function bindGraphEvents(nodeMap) {
  const selectNode = (nodeId) => {
    selectedNodeId = nodeId;
    applyFilters(nodeMap);
    updateInspector();
  };

  for (const element of graphCanvas.querySelectorAll("[data-node]")) {
    element.addEventListener("click", () => selectNode(element.dataset.node));
  }
}

function nodeMatchesSearch(nodeId) {
  return !currentNodeSearch || nodeId.toLowerCase().includes(currentNodeSearch);
}

function nodeIsNeighbor(nodeId) {
  if (!selectedNodeId) {
    return false;
  }
  const incomingIds = currentGraph.edges.filter((edge) => edge.target === selectedNodeId).map((edge) => edge.source);
  const outgoingIds = currentGraph.edges.filter((edge) => edge.source === selectedNodeId).map((edge) => edge.target);
  return incomingIds.includes(nodeId) || outgoingIds.includes(nodeId);
}

function applyFilters(nodeMap) {
  const shapes = graphCanvas.querySelectorAll(".node-shape");
  const labels = graphCanvas.querySelectorAll(".node-label");
  const edges = graphCanvas.querySelectorAll(".edge-line");

  for (const shape of shapes) {
    const nodeId = shape.dataset.node;
    const selected = selectedNodeId === nodeId;
    const neighbor = nodeIsNeighbor(nodeId);
    const muted = currentNodeSearch && !nodeMatchesSearch(nodeId) && !selected && !neighbor;
    shape.classList.toggle("selected", selected);
    shape.classList.toggle("neighbor", neighbor && !selected);
    shape.classList.toggle("muted", muted);
  }

  for (const label of labels) {
    const nodeId = label.dataset.node;
    const selected = selectedNodeId === nodeId;
    const neighbor = nodeIsNeighbor(nodeId);
    const muted = currentNodeSearch && !nodeMatchesSearch(nodeId) && !selected && !neighbor;
    label.classList.toggle("selected", selected);
    label.classList.toggle("neighbor", neighbor && !selected);
    label.classList.toggle("muted", muted);
  }

  for (const edge of edges) {
    const { source, target } = edge.dataset;
    const active = selectedNodeId && (selectedNodeId === source || selectedNodeId === target);
    const muted =
      (currentNodeSearch && !nodeMatchesSearch(source) && !nodeMatchesSearch(target)) ||
      (selectedNodeId && !active);
    edge.classList.toggle("active", Boolean(active));
    edge.classList.toggle("muted", muted);
  }
}

function updateInspector() {
  if (!selectedNodeId) {
    selectedNodeTitle.textContent = "Node selection";
    selectedNodeKind.textContent = "Click a node to inspect its incoming and outgoing edges.";
    incomingList.innerHTML = "<li>None</li>";
    outgoingList.innerHTML = "<li>None</li>";
    return;
  }

  const node = currentGraph.nodes.find((entry) => entry.id === selectedNodeId);
  const incoming = currentGraph.edges.filter((edge) => edge.target === selectedNodeId).map((edge) => edge.source);
  const outgoing = currentGraph.edges.filter((edge) => edge.source === selectedNodeId).map((edge) => edge.target);

  selectedNodeTitle.textContent = node.id;
  selectedNodeKind.textContent = `${node.kindLabel} node | ${incoming.length + outgoing.length} adjacent edges`;
  incomingList.innerHTML = listMarkup(incoming);
  outgoingList.innerHTML = listMarkup(outgoing);
}

function start(catalogData) {
  catalog = catalogData;
  graphCountPill.textContent = `${catalog.graphCount} graphs`;
  currentGraph = catalog.graphs.find((graph) => graph.title === "SANS Risk") || catalog.graphs[0];
  renderRiskList();
  renderGraph();
  updateInspector();
}

if (doc) {
  layoutMode.value = currentLayoutMode;
  updateZoomStatus();

  layoutMode.addEventListener("change", () => {
    currentLayoutMode = layoutMode.value;
    renderGraph();
    updateInspector();
  });

  riskSearch.addEventListener("input", () => {
    currentRiskSearch = riskSearch.value.trim().toLowerCase();
    renderRiskList();
  });

  nodeSearch.addEventListener("input", () => {
    currentNodeSearch = nodeSearch.value.trim().toLowerCase();
    applyFilters(graphNodeMap(currentGraph));
  });

  clearNodeSelection.addEventListener("click", () => {
    selectedNodeId = null;
    applyFilters(graphNodeMap(currentGraph));
    updateInspector();
  });

  zoomOut.addEventListener("click", () => {
    currentZoom = clampZoom(currentZoom - 0.2);
    renderGraph();
  });

  zoomReset.addEventListener("click", () => {
    currentZoom = 1;
    renderGraph();
  });

  zoomIn.addEventListener("click", () => {
    currentZoom = clampZoom(currentZoom + 0.2);
    renderGraph();
  });

  fetch("./data/dags.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load DAG catalog: ${response.status}`);
      }
      return response.json();
    })
    .then(start)
    .catch((error) => {
      graphTitle.textContent = "Catalog load failed";
      graphSubtitle.textContent = error.message;
      graphCanvas.innerHTML = `<div class="card" style="margin:20px;">${error.message}</div>`;
    });
}

export { computeGraphLayout, computeStructuredGraphLayout, computePaperGraphLayout, measureNode, wrapLabel };
