const kindStyles = {
  default: { fill: "#f8fafc", stroke: "#334155" },
  exposure: { fill: "#cffafe", stroke: "#0f766e" },
  latent: { fill: "#fee2e2", stroke: "#b91c1c" },
  outcome: { fill: "#fef3c7", stroke: "#a16207" },
};

const riskList = document.getElementById("riskList");
const graphCanvas = document.getElementById("graphCanvas");
const graphCountPill = document.getElementById("graphCountPill");
const graphTitle = document.getElementById("graphTitle");
const graphSubtitle = document.getElementById("graphSubtitle");
const riskSearch = document.getElementById("riskSearch");
const nodeSearch = document.getElementById("nodeSearch");
const clearNodeSelection = document.getElementById("clearNodeSelection");

const nodeCount = document.getElementById("nodeCount");
const edgeCount = document.getElementById("edgeCount");
const componentCount = document.getElementById("componentCount");
const warningCount = document.getElementById("warningCount");
const selectedNodeTitle = document.getElementById("selectedNodeTitle");
const selectedNodeKind = document.getElementById("selectedNodeKind");
const incomingList = document.getElementById("incomingList");
const outgoingList = document.getElementById("outgoingList");
const warningList = document.getElementById("warningList");
const rootList = document.getElementById("rootList");
const sinkList = document.getElementById("sinkList");

let catalog = null;
let currentGraph = null;
let selectedNodeId = null;
let currentNodeSearch = "";
let currentRiskSearch = "";

function listMarkup(items) {
  if (!items.length) {
    return "<li>None</li>";
  }
  return items.map((item) => `<li>${item}</li>`).join("");
}

function wrapLabel(label, width = 22) {
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

function measureNode(label) {
  const lines = wrapLabel(label);
  const longest = Math.max(...lines.map((line) => line.length));
  return {
    width: Math.max(118, Math.min(250, longest * 7 + 28)),
    height: 18 + lines.length * 17,
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

function graphNodeMap(graph) {
  return new Map(graph.nodes.map((node) => [node.id, node]));
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
  const measured = new Map(currentGraph.nodes.map((node) => [node.id, measureNode(node.id)]));
  const minX = Math.min(...currentGraph.nodes.map((node) => node.x));
  const maxX = Math.max(...currentGraph.nodes.map((node) => node.x));
  const minY = Math.min(...currentGraph.nodes.map((node) => node.y));
  const maxY = Math.max(...currentGraph.nodes.map((node) => node.y));
  const scale = 310;
  const padding = 120;
  const width = Math.round((maxX - minX) * scale + padding * 2);
  const height = Math.round((maxY - minY) * scale + padding * 2);

  const coords = new Map();
  for (const node of currentGraph.nodes) {
    const box = measured.get(node.id);
    coords.set(node.id, {
      cx: (node.x - minX) * scale + padding,
      cy: (maxY - node.y) * scale + padding,
      ...box,
    });
  }

  const edgesMarkup = currentGraph.edges
    .map((edge) => {
      const source = coords.get(edge.source);
      const target = coords.get(edge.target);
      const start = rectEdgePoint(source.cx, source.cy, source.width, source.height, target.cx, target.cy);
      const end = rectEdgePoint(target.cx, target.cy, target.width, target.height, source.cx, source.cy);
      return `<line class="edge-line" data-source="${edge.source}" data-target="${edge.target}" x1="${start.x.toFixed(
        1
      )}" y1="${start.y.toFixed(1)}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(
        1
      )}" stroke="#64748b" stroke-width="1.4" marker-end="url(#arrow)"><title>${edge.source} -> ${edge.target}</title></line>`;
    })
    .join("");

  const nodesMarkup = currentGraph.nodes
    .map((node) => {
      const style = kindStyles[node.kind];
      const box = coords.get(node.id);
      const x = box.cx - box.width / 2;
      const y = box.cy - box.height / 2;
      const textY = box.cy - ((box.lines.length - 1) * 8);
      const tspanMarkup = box.lines
        .map(
          (line, index) =>
            `<tspan x="${box.cx.toFixed(1)}" dy="${index === 0 ? 0 : 16}">${line}</tspan>`
        )
        .join("");

      return `<g class="node-group" data-node="${node.id}">
        <rect class="node-rect" data-node="${node.id}" x="${x.toFixed(1)}" y="${y.toFixed(
          1
        )}" width="${box.width.toFixed(1)}" height="${box.height.toFixed(
          1
        )}" rx="14" ry="14" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.7"></rect>
        <text class="node-label" data-node="${node.id}" x="${box.cx.toFixed(
          1
        )}" y="${textY.toFixed(
          1
        )}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="600" fill="#0f172a">${tspanMarkup}</text>
        <title>${node.id}</title>
      </g>`;
    })
    .join("");

  graphCanvas.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
        </marker>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg)" />
      ${edgesMarkup}
      ${nodesMarkup}
    </svg>`;

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
  const rects = graphCanvas.querySelectorAll(".node-rect");
  const labels = graphCanvas.querySelectorAll(".node-label");
  const edges = graphCanvas.querySelectorAll(".edge-line");

  for (const rect of rects) {
    const nodeId = rect.dataset.node;
    const selected = selectedNodeId === nodeId;
    const neighbor = nodeIsNeighbor(nodeId);
    const muted = currentNodeSearch && !nodeMatchesSearch(nodeId) && !selected && !neighbor;
    rect.classList.toggle("selected", selected);
    rect.classList.toggle("neighbor", neighbor && !selected);
    rect.classList.toggle("muted", muted);
  }

  for (const label of labels) {
    const nodeId = label.dataset.node;
    const selected = selectedNodeId === nodeId;
    const neighbor = nodeIsNeighbor(nodeId);
    const muted = currentNodeSearch && !nodeMatchesSearch(nodeId) && !selected && !neighbor;
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
