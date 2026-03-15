#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import textwrap
import webbrowser
from collections import defaultdict, deque
from pathlib import Path

PDF_SOURCE = (
    Path(__file__).resolve().parent
    / "HSRB"
    / "TP_Directed Acyclic Graphs_ A Tool for Understanding the nature of the NASA Human System Risks_NASA-TP-20220015709.pdf"
)

SOURCE_NOTE = (
    "Validated against the Appendix C 'SANS Risk' DAGitty export in "
    "NASA-TP-20220015709. The node positions below come from the extracted "
    "SANS Appendix C block shown on PDF pages 200-201 in local text extraction."
)

NODE_SPECS = [
    ("Altered Gravity", -1.879, 0.350, "exposure"),
    ("Astronaut Selection", -1.840, 1.350, "default"),
    ("Brain Structural Changes", -1.430, 0.948, "default"),
    ("CO2 (Risk)", -1.430, -0.438, "latent"),
    ("Cardiovascular (Risk)", -0.721, -0.664, "latent"),
    ("Chorioretinal Folds", -0.226, -0.496, "default"),
    ("Crew Capability", 0.705, -1.715, "default"),
    ("Crew Health and Performance System", -0.831, -2.948, "default"),
    ("Detect Brain Structural Changes", -0.015, 1.193, "default"),
    ("Detect Intracranial Pressure Changes", -1.042, 0.539, "default"),
    ("Detect Long Term Health Outcomes", 0.600, 0.801, "default"),
    ("Detect Ocular Structural Changes", -0.039, -1.701, "default"),
    ("Detect Visual Changes", 0.133, -2.151, "default"),
    ("Distance from Earth", -1.845, -2.961, "exposure"),
    ("Flight Recertification", 0.698, -0.710, "outcome"),
    ("Fluid Shifts", -1.590, 0.356, "default"),
    ("Food and Nutrition (Risk)", -1.636, -2.233, "latent"),
    ("Globe Flattening", -0.555, -1.068, "default"),
    ("HSIA (Risk)", -1.239, -2.553, "latent"),
    ("Individual Factors", -0.523, 1.350, "default"),
    ("Individual Readiness", 0.456, -1.443, "default"),
    ("Intracranial Pressure Changes", -1.146, 0.053, "default"),
    ("Intracranial Pressure Monitoring", -0.749, -1.552, "default"),
    ("Long Term Health Outcomes", 0.649, 0.033, "outcome"),
    ("Loss of Mission Objectives", 0.657, -2.973, "outcome"),
    ("Loss of Mission", 0.761, -3.490, "outcome"),
    ("Lower Body Negative Pressure", -1.767, 0.679, "default"),
    ("Medical Prevention Capability", -1.710, -1.538, "default"),
    ("Medical Treatment Capability", 0.204, -2.941, "default"),
    ("Optic Disc Edema", -0.597, -0.217, "default"),
    ("Optical Coherence Tomography", -0.492, -2.021, "default"),
    ("Pharm (Risk)", -1.901, -1.804, "latent"),
    ("Physiologic Monitoring Capability", -0.805, -2.464, "default"),
    ("Refractive Error Shift", 0.009, -1.000, "default"),
    ("Retinal Nerve Fiber Layer Atrophy", -0.171, 0.335, "default"),
    ("Sleep (Risk)", -1.606, -0.149, "latent"),
    ("Task Performance", 0.716, -2.226, "outcome"),
    ("Thigh Cuffs", -1.617, -0.918, "default"),
    ("Vascular Congestion", -1.141, -0.891, "default"),
    ("Vehicle Design", -1.441, -2.948, "default"),
    ("Visual Acuity Test", -0.262, -2.758, "default"),
    ("Visual Field Defect", 0.154, 0.216, "default"),
    ("Visual Fields Test", -0.299, -2.222, "default"),
    ("Fundoscopy", -0.922, -1.804, "default"),
    ("Lenses", 0.380, -2.273, "default"),
    ("MRI", -0.653, 0.492, "default"),
    ("Medications", -1.450, -1.102, "default"),
    ("Supplements", -1.404, -1.708, "default"),
    ("Surveillance", 0.361, 1.351, "default"),
    ("Ultrasound", -1.104, -2.056, "default"),
]

EDGE_SPECS = [
    ("Altered Gravity", "Fluid Shifts"),
    ("Astronaut Selection", "Individual Factors"),
    ("Brain Structural Changes", "Detect Brain Structural Changes"),
    ("Brain Structural Changes", "Long Term Health Outcomes"),
    ("CO2 (Risk)", "Intracranial Pressure Changes"),
    ("Cardiovascular (Risk)", "Optic Disc Edema"),
    ("Chorioretinal Folds", "Detect Ocular Structural Changes"),
    ("Chorioretinal Folds", "Flight Recertification"),
    ("Chorioretinal Folds", "Visual Field Defect"),
    ("Crew Capability", "Task Performance"),
    ("Crew Health and Performance System", "Medical Prevention Capability"),
    ("Crew Health and Performance System", "Medical Treatment Capability"),
    ("Crew Health and Performance System", "Physiologic Monitoring Capability"),
    ("Detect Brain Structural Changes", "Detect Long Term Health Outcomes"),
    ("Detect Intracranial Pressure Changes", "Detect Long Term Health Outcomes"),
    ("Detect Intracranial Pressure Changes", "Flight Recertification"),
    ("Detect Intracranial Pressure Changes", "Medical Treatment Capability"),
    ("Detect Ocular Structural Changes", "Detect Long Term Health Outcomes"),
    ("Detect Ocular Structural Changes", "Flight Recertification"),
    ("Detect Visual Changes", "Medical Treatment Capability"),
    ("Distance from Earth", "Vehicle Design"),
    ("Fluid Shifts", "Brain Structural Changes"),
    ("Fluid Shifts", "Intracranial Pressure Changes"),
    ("Fluid Shifts", "Vascular Congestion"),
    ("Food and Nutrition (Risk)", "Supplements"),
    ("Globe Flattening", "Chorioretinal Folds"),
    ("Globe Flattening", "Detect Ocular Structural Changes"),
    ("Globe Flattening", "Refractive Error Shift"),
    ("HSIA (Risk)", "Crew Health and Performance System"),
    ("HSIA (Risk)", "Vehicle Design"),
    ("Individual Factors", "Brain Structural Changes"),
    ("Individual Factors", "Chorioretinal Folds"),
    ("Individual Factors", "Globe Flattening"),
    ("Individual Factors", "Intracranial Pressure Changes"),
    ("Individual Factors", "Optic Disc Edema"),
    ("Individual Factors", "Refractive Error Shift"),
    ("Individual Factors", "Retinal Nerve Fiber Layer Atrophy"),
    ("Individual Factors", "Vascular Congestion"),
    ("Individual Factors", "Visual Field Defect"),
    ("Individual Readiness", "Crew Capability"),
    ("Intracranial Pressure Changes", "Brain Structural Changes"),
    ("Intracranial Pressure Changes", "Detect Intracranial Pressure Changes"),
    ("Intracranial Pressure Changes", "Globe Flattening"),
    ("Intracranial Pressure Changes", "Long Term Health Outcomes"),
    ("Intracranial Pressure Changes", "Optic Disc Edema"),
    ("Intracranial Pressure Monitoring", "Detect Intracranial Pressure Changes"),
    ("Long Term Health Outcomes", "Detect Long Term Health Outcomes"),
    ("Loss of Mission Objectives", "Loss of Mission"),
    ("Lower Body Negative Pressure", "Vascular Congestion"),
    ("Medical Prevention Capability", "Lower Body Negative Pressure"),
    ("Medical Prevention Capability", "Thigh Cuffs"),
    ("Medical Prevention Capability", "Medications"),
    ("Medical Prevention Capability", "Supplements"),
    ("Medical Treatment Capability", "Lenses"),
    ("Optic Disc Edema", "Chorioretinal Folds"),
    ("Optic Disc Edema", "Detect Ocular Structural Changes"),
    ("Optic Disc Edema", "Retinal Nerve Fiber Layer Atrophy"),
    ("Optic Disc Edema", "Visual Field Defect"),
    ("Optical Coherence Tomography", "Detect Ocular Structural Changes"),
    ("Pharm (Risk)", "Medical Prevention Capability"),
    ("Physiologic Monitoring Capability", "Intracranial Pressure Monitoring"),
    ("Physiologic Monitoring Capability", "Optical Coherence Tomography"),
    ("Physiologic Monitoring Capability", "Visual Acuity Test"),
    ("Physiologic Monitoring Capability", "Visual Fields Test"),
    ("Physiologic Monitoring Capability", "Fundoscopy"),
    ("Physiologic Monitoring Capability", "Ultrasound"),
    ("Refractive Error Shift", "Detect Visual Changes"),
    ("Refractive Error Shift", "Individual Readiness"),
    ("Retinal Nerve Fiber Layer Atrophy", "Visual Field Defect"),
    ("Sleep (Risk)", "Intracranial Pressure Changes"),
    ("Task Performance", "Loss of Mission Objectives"),
    ("Thigh Cuffs", "Vascular Congestion"),
    ("Vascular Congestion", "Globe Flattening"),
    ("Vascular Congestion", "Intracranial Pressure Changes"),
    ("Vascular Congestion", "Optic Disc Edema"),
    ("Vehicle Design", "Crew Health and Performance System"),
    ("Visual Acuity Test", "Detect Visual Changes"),
    ("Visual Field Defect", "Detect Visual Changes"),
    ("Visual Field Defect", "Individual Readiness"),
    ("Visual Field Defect", "Long Term Health Outcomes"),
    ("Visual Fields Test", "Detect Visual Changes"),
    ("Fundoscopy", "Detect Ocular Structural Changes"),
    ("Lenses", "Individual Readiness"),
    ("MRI", "Detect Brain Structural Changes"),
    ("MRI", "Detect Ocular Structural Changes"),
    ("Medications", "Intracranial Pressure Changes"),
    ("Medications", "Vascular Congestion"),
    ("Supplements", "Intracranial Pressure Changes"),
    ("Surveillance", "Detect Long Term Health Outcomes"),
    ("Ultrasound", "Detect Ocular Structural Changes"),
]

MAIN_PATH = [
    "Altered Gravity",
    "Fluid Shifts",
    "Vascular Congestion",
    "Intracranial Pressure Changes",
    "Optic Disc Edema",
    "Visual Field Defect",
    "Individual Readiness",
    "Crew Capability",
    "Task Performance",
    "Loss of Mission Objectives",
    "Loss of Mission",
]

KIND_STYLE = {
    "default": {"fill": "#f8fafc", "stroke": "#334155", "label": "Operational / clinical"},
    "exposure": {"fill": "#cffafe", "stroke": "#0f766e", "label": "Exposure"},
    "latent": {"fill": "#fee2e2", "stroke": "#b91c1c", "label": "Latent / linked risk"},
    "outcome": {"fill": "#fef3c7", "stroke": "#a16207", "label": "Outcome"},
}


def build_nodes():
    nodes = {}
    for name, x_pos, y_pos, kind in NODE_SPECS:
        nodes[name] = {"x": x_pos, "y": y_pos, "kind": kind}
    return nodes


def build_graph(edges):
    outgoing = defaultdict(list)
    incoming = defaultdict(list)
    undirected = defaultdict(set)
    for source, target in edges:
        outgoing[source].append(target)
        incoming[target].append(source)
        undirected[source].add(target)
        undirected[target].add(source)
    return outgoing, incoming, undirected


def find_cycle(nodes, outgoing):
    visited = {}
    stack = []

    def dfs(node):
        visited[node] = "visiting"
        stack.append(node)
        for neighbor in outgoing.get(node, []):
            state = visited.get(neighbor)
            if state == "visiting":
                index = stack.index(neighbor)
                return stack[index:] + [neighbor]
            if state != "visited":
                cycle = dfs(neighbor)
                if cycle:
                    return cycle
        stack.pop()
        visited[node] = "visited"
        return None

    for node in nodes:
        if visited.get(node) is None:
            cycle = dfs(node)
            if cycle:
                return cycle
    return None


def weak_components(nodes, undirected):
    components = []
    seen = set()
    for node in nodes:
        if node in seen:
            continue
        queue = deque([node])
        seen.add(node)
        component = []
        while queue:
            current = queue.popleft()
            component.append(current)
            for neighbor in undirected.get(current, set()):
                if neighbor not in seen:
                    seen.add(neighbor)
                    queue.append(neighbor)
        components.append(sorted(component))
    return components


def has_path(start, goal, outgoing):
    queue = deque([start])
    seen = {start}
    while queue:
        current = queue.popleft()
        if current == goal:
            return True
        for neighbor in outgoing.get(current, []):
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)
    return False


def validate_graph(nodes, edges):
    edge_refs = {node for edge in edges for node in edge}
    missing_nodes = sorted(edge_refs - set(nodes))
    duplicate_edges = sorted({edge for edge in edges if edges.count(edge) > 1})
    self_loops = sorted(edge for edge in edges if edge[0] == edge[1])

    outgoing, incoming, undirected = build_graph(edges)
    cycle = None if missing_nodes else find_cycle(nodes, outgoing)
    components = weak_components(nodes, undirected)
    roots = sorted(node for node in nodes if not incoming.get(node))
    sinks = sorted(node for node in nodes if not outgoing.get(node))

    path_checks = {
        "Altered Gravity -> Loss of Mission": has_path("Altered Gravity", "Loss of Mission", outgoing),
        "Altered Gravity -> Flight Recertification": has_path(
            "Altered Gravity", "Flight Recertification", outgoing
        ),
        "Distance from Earth -> Loss of Mission": has_path(
            "Distance from Earth", "Loss of Mission", outgoing
        ),
        "HSIA (Risk) -> Detect Long Term Health Outcomes": has_path(
            "HSIA (Risk)", "Detect Long Term Health Outcomes", outgoing
        ),
    }

    return {
        "missing_nodes": missing_nodes,
        "duplicate_edges": duplicate_edges,
        "self_loops": self_loops,
        "cycle": cycle,
        "components": components,
        "roots": roots,
        "sinks": sinks,
        "path_checks": path_checks,
        "outgoing": outgoing,
        "incoming": incoming,
    }


def node_box_size(label):
    lines = textwrap.wrap(label, width=22, break_long_words=False)
    line_count = max(1, len(lines))
    width = max(118, min(250, max(len(line) for line in lines) * 7 + 28))
    height = 18 + line_count * 17
    return width, height, lines


def rect_edge_point(center_x, center_y, width, height, toward_x, toward_y):
    dx = toward_x - center_x
    dy = toward_y - center_y
    if dx == 0 and dy == 0:
        return center_x, center_y

    half_w = width / 2
    half_h = height / 2
    scale_x = float("inf") if dx == 0 else half_w / abs(dx)
    scale_y = float("inf") if dy == 0 else half_h / abs(dy)
    scale = min(scale_x, scale_y)
    return center_x + dx * scale, center_y + dy * scale


def render_svg(nodes, edges, output_path):
    min_x = min(node["x"] for node in nodes.values())
    max_x = max(node["x"] for node in nodes.values())
    min_y = min(node["y"] for node in nodes.values())
    max_y = max(node["y"] for node in nodes.values())

    scale = 315
    padding = 120
    legend_width = 290

    def x_screen(x_pos):
        return (x_pos - min_x) * scale + padding

    def y_screen(y_pos):
        return (max_y - y_pos) * scale + padding

    layout = {}
    for name, data in nodes.items():
        width, height, lines = node_box_size(name)
        layout[name] = {
            "cx": x_screen(data["x"]),
            "cy": y_screen(data["y"]),
            "width": width,
            "height": height,
            "lines": lines,
            "kind": data["kind"],
        }

    canvas_width = int((max_x - min_x) * scale + padding * 2 + legend_width)
    canvas_height = int((max_y - min_y) * scale + padding * 2)

    main_edges = set(zip(MAIN_PATH, MAIN_PATH[1:]))

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{canvas_width}" height="{canvas_height}" viewBox="0 0 {canvas_width} {canvas_height}">',
        "<defs>",
        '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
        '<stop offset="0%" stop-color="#f8fafc" />',
        '<stop offset="100%" stop-color="#e2e8f0" />',
        "</linearGradient>",
        '<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">',
        '<path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />',
        "</marker>",
        '<marker id="arrow-main" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">',
        '<path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />',
        "</marker>",
        "</defs>",
        f'<rect x="0" y="0" width="{canvas_width}" height="{canvas_height}" fill="url(#bg)" />',
        (
            '<text x="36" y="42" font-size="26" font-family="Segoe UI, Arial, sans-serif" '
            'font-weight="700" fill="#0f172a">Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS Risk)</text>'
        ),
        (
            '<text x="36" y="68" font-size="13" font-family="Segoe UI, Arial, sans-serif" '
            'fill="#475569">Appendix C DAGitty export translated into standalone Python and rendered from the source coordinates.</text>'
        ),
    ]

    for source, target in edges:
        source_box = layout[source]
        target_box = layout[target]
        start_x, start_y = rect_edge_point(
            source_box["cx"],
            source_box["cy"],
            source_box["width"],
            source_box["height"],
            target_box["cx"],
            target_box["cy"],
        )
        end_x, end_y = rect_edge_point(
            target_box["cx"],
            target_box["cy"],
            target_box["width"],
            target_box["height"],
            source_box["cx"],
            source_box["cy"],
        )
        highlight = (source, target) in main_edges
        stroke = "#ea580c" if highlight else "#64748b"
        width = "2.6" if highlight else "1.35"
        marker = "arrow-main" if highlight else "arrow"
        parts.append(
            (
                f'<line x1="{start_x:.1f}" y1="{start_y:.1f}" x2="{end_x:.1f}" y2="{end_y:.1f}" '
                f'stroke="{stroke}" stroke-width="{width}" marker-end="url(#{marker})" opacity="0.95">'
                f"<title>{html.escape(source)} -> {html.escape(target)}</title>"
                "</line>"
            )
        )

    for name, box in layout.items():
        style = KIND_STYLE[box["kind"]]
        x_pos = box["cx"] - box["width"] / 2
        y_pos = box["cy"] - box["height"] / 2
        parts.append(
            (
                f'<rect x="{x_pos:.1f}" y="{y_pos:.1f}" width="{box["width"]:.1f}" height="{box["height"]:.1f}" '
                f'rx="14" ry="14" fill="{style["fill"]}" stroke="{style["stroke"]}" stroke-width="1.7">'
                f"<title>{html.escape(name)}</title>"
                "</rect>"
            )
        )
        text_y = box["cy"] - ((len(box["lines"]) - 1) * 8)
        parts.append(
            (
                f'<text x="{box["cx"]:.1f}" y="{text_y:.1f}" text-anchor="middle" '
                'font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="600" fill="#0f172a">'
            )
        )
        for index, line in enumerate(box["lines"]):
            dy = 16 if index else 0
            parts.append(
                f'<tspan x="{box["cx"]:.1f}" dy="{dy}">{html.escape(line)}</tspan>'
            )
        parts.append("</text>")

    legend_x = canvas_width - legend_width + 18
    legend_y = 120
    parts.extend(
        [
            f'<rect x="{legend_x - 12}" y="{legend_y - 24}" width="{legend_width - 36}" height="282" rx="18" ry="18" fill="#ffffff" stroke="#cbd5e1" />',
            (
                f'<text x="{legend_x}" y="{legend_y}" font-size="18" font-family="Segoe UI, Arial, sans-serif" '
                'font-weight="700" fill="#0f172a">Legend</text>'
            ),
        ]
    )

    legend_items = [
        ("Exposure node", KIND_STYLE["exposure"]["fill"], KIND_STYLE["exposure"]["stroke"]),
        ("Latent / linked risk", KIND_STYLE["latent"]["fill"], KIND_STYLE["latent"]["stroke"]),
        ("Outcome node", KIND_STYLE["outcome"]["fill"], KIND_STYLE["outcome"]["stroke"]),
        ("Operational / clinical node", KIND_STYLE["default"]["fill"], KIND_STYLE["default"]["stroke"]),
    ]
    for index, (label, fill, stroke) in enumerate(legend_items):
        item_y = legend_y + 28 + index * 34
        parts.append(
            f'<rect x="{legend_x}" y="{item_y - 12}" width="18" height="18" rx="6" ry="6" fill="{fill}" stroke="{stroke}" />'
        )
        parts.append(
            (
                f'<text x="{legend_x + 30}" y="{item_y + 1}" font-size="13" font-family="Segoe UI, Arial, sans-serif" '
                f'fill="#334155">{html.escape(label)}</text>'
            )
        )

    info_lines = textwrap.wrap(SOURCE_NOTE, width=34, break_long_words=False)
    parts.append(
        (
            f'<text x="{legend_x}" y="{legend_y + 176}" font-size="13" font-family="Segoe UI, Arial, sans-serif" '
            'font-weight="700" fill="#0f172a">Source note</text>'
        )
    )
    line_y = legend_y + 198
    for line in info_lines:
        parts.append(
            (
                f'<text x="{legend_x}" y="{line_y}" font-size="12" font-family="Segoe UI, Arial, sans-serif" '
                f'fill="#475569">{html.escape(line)}</text>'
            )
        )
        line_y += 18

    parts.append(
        (
            f'<text x="{legend_x}" y="{line_y + 18}" font-size="12" font-family="Segoe UI, Arial, sans-serif" '
            'fill="#475569">Orange edges mark the main mission-consequence path.</text>'
        )
    )
    parts.append("</svg>")

    output_path.write_text("\n".join(parts), encoding="utf-8")


def build_graph_payload(nodes, edges, validation):
    edge_ids = {f"{source}|{target}" for source, target in zip(MAIN_PATH, MAIN_PATH[1:])}
    payload = {
        "sourcePdf": str(PDF_SOURCE),
        "sourceNote": SOURCE_NOTE,
        "counts": {
            "nodes": len(nodes),
            "edges": len(edges),
            "components": len(validation["components"]),
        },
        "mainPath": MAIN_PATH,
        "nodes": {},
        "edges": [],
    }

    for name, node in nodes.items():
        payload["nodes"][name] = {
            "kind": node["kind"],
            "kindLabel": KIND_STYLE[node["kind"]]["label"],
            "incoming": sorted(validation["incoming"].get(name, [])),
            "outgoing": sorted(validation["outgoing"].get(name, [])),
            "isMainPath": name in MAIN_PATH,
        }

    for source, target in edges:
        payload["edges"].append(
            {
                "source": source,
                "target": target,
                "id": f"{source}|{target}",
                "isMainPath": f"{source}|{target}" in edge_ids,
            }
        )

    return payload


def render_html(nodes, edges, validation, svg_path, html_path):
    svg_markup = svg_path.read_text(encoding="utf-8")
    payload = build_graph_payload(nodes, edges, validation)
    roots_html = "".join(f"<li>{html.escape(item)}</li>" for item in validation["roots"])
    sinks_html = "".join(f"<li>{html.escape(item)}</li>" for item in validation["sinks"])
    summary = (
        f"{len(nodes)} nodes, {len(edges)} edges, "
        f"{len(validation['components'])} connected component, cycle detected: no"
    )

    template = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SANS Risk Interactive Viewer</title>
    <style>
      :root {
        --bg: #e2e8f0;
        --panel: rgba(255, 255, 255, 0.88);
        --border: #cbd5e1;
        --text: #0f172a;
        --muted: #475569;
        --accent: #ea580c;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Segoe UI", Arial, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 24%),
          radial-gradient(circle at top right, rgba(234, 88, 12, 0.18), transparent 22%),
          linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
      }
      .page {
        max-width: 1800px;
        margin: 0 auto;
        padding: 24px;
      }
      .hero {
        border-radius: 28px;
        padding: 24px 28px;
        color: white;
        background: linear-gradient(135deg, #0f172a 0%, #164e63 46%, #ea580c 100%);
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.16);
      }
      .hero h1 {
        margin: 0 0 8px;
        font-size: 2rem;
      }
      .hero p {
        margin: 0;
        max-width: 78ch;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.85);
      }
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
      }
      .toolbar input {
        min-width: 280px;
        border: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 999px;
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.14);
        color: white;
        outline: none;
      }
      .toolbar input::placeholder { color: rgba(255, 255, 255, 0.68); }
      .toolbar button {
        border: 0;
        border-radius: 999px;
        padding: 11px 15px;
        background: rgba(255, 255, 255, 0.14);
        color: white;
        font-weight: 600;
        cursor: pointer;
      }
      .toolbar button.active {
        background: white;
        color: var(--text);
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.9fr) 380px;
        gap: 20px;
        margin-top: 20px;
      }
      .panel {
        border: 1px solid rgba(255, 255, 255, 0.55);
        border-radius: 28px;
        background: var(--panel);
        backdrop-filter: blur(14px);
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
      }
      .graph-panel {
        display: flex;
        flex-direction: column;
        min-height: 78vh;
        overflow: hidden;
      }
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 18px 22px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.25);
      }
      .panel-header h2 {
        margin: 0;
        font-size: 1.05rem;
      }
      .panel-header p {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 0.92rem;
      }
      .badge {
        border-radius: 999px;
        padding: 8px 11px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 0.8rem;
        font-weight: 700;
      }
      .svg-shell {
        flex: 1;
        overflow: auto;
        padding: 8px;
      }
      .svg-shell svg {
        display: block;
        width: 100%;
        min-width: 1100px;
        height: auto;
      }
      .inspector {
        padding: 20px;
      }
      .inspector h3 {
        margin: 0 0 8px;
        font-size: 1rem;
      }
      .inspector p, .inspector li {
        color: var(--muted);
        line-height: 1.55;
      }
      .inspector ul {
        margin: 8px 0 0;
        padding-left: 18px;
      }
      .split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .card {
        margin-top: 14px;
        padding: 14px;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        background: rgba(248, 250, 252, 0.95);
      }
      .statline {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 12px;
      }
      .statline span {
        border-radius: 999px;
        padding: 7px 10px;
        background: #f1f5f9;
        color: #334155;
        font-size: 0.8rem;
        font-weight: 700;
      }
      .node-rect, .node-label {
        cursor: pointer;
        transition: opacity 160ms ease;
      }
      .node-rect {
        transition: opacity 160ms ease, stroke-width 160ms ease, filter 160ms ease;
      }
      .node-label {
        transition: opacity 160ms ease, font-weight 160ms ease;
      }
      .node-rect.selected {
        stroke: #0f172a !important;
        stroke-width: 3.4;
        filter: drop-shadow(0 10px 18px rgba(15, 23, 42, 0.22));
      }
      .node-rect.neighbor {
        stroke-width: 2.8;
      }
      .node-label.selected, .node-label.neighbor {
        font-weight: 700;
      }
      .node-rect.muted, .node-label.muted, .edge-line.muted {
        opacity: 0.14;
      }
      .node-rect.hidden, .node-label.hidden, .edge-line.hidden {
        display: none;
      }
      .edge-line {
        transition: opacity 160ms ease, stroke-width 160ms ease, stroke 160ms ease;
      }
      .edge-line.active {
        stroke: #0f172a !important;
        stroke-width: 2.9;
        opacity: 1;
      }
      .hint {
        margin-top: 14px;
        font-size: 0.86rem;
        color: var(--muted);
      }
      @media (max-width: 1200px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <section class="hero">
        <h1>SANS Risk interactive viewer</h1>
        <p>Search nodes, click a node to inspect its parents and children, and toggle the main mission path without changing the validated Appendix C graph structure.</p>
        <div class="toolbar">
          <input id="search" type="search" placeholder="Search nodes like optic, mission, MRI..." />
          <button id="mainPathToggle" type="button">Main path only</button>
          <button id="clearSelection" type="button">Clear selection</button>
          <button id="resetAll" type="button">Reset all</button>
        </div>
      </section>

      <section class="layout">
        <div class="panel graph-panel">
          <div class="panel-header">
            <div>
              <h2>SANS DAG</h2>
              <p id="statusLine">__SUMMARY__</p>
            </div>
            <div class="badge">Appendix C validated</div>
          </div>
          <div class="svg-shell" id="svgShell">
            __SVG__
          </div>
        </div>

        <aside class="panel inspector">
          <h3>Inspector</h3>
          <p id="selectionTitle">Click a node to inspect its local connections.</p>
          <div class="statline">
            <span id="kindPill">Kind: none</span>
            <span id="degreePill">Degree: 0</span>
          </div>

          <div class="card">
            <h3>Incoming</h3>
            <ul id="incomingList"><li>None</li></ul>
          </div>

          <div class="card">
            <h3>Outgoing</h3>
            <ul id="outgoingList"><li>None</li></ul>
          </div>

          <div class="card">
            <h3>Validation</h3>
            <p>__SUMMARY__</p>
            <p>Source PDF: __PDF_SOURCE__</p>
          </div>

          <div class="card split">
            <div>
              <h3>Roots</h3>
              <ul>__ROOTS__</ul>
            </div>
            <div>
              <h3>Sinks</h3>
              <ul>__SINKS__</ul>
            </div>
          </div>

          <p class="hint">Orange edges show the main mission-consequence path. Search dims non-matching regions without changing the graph.</p>
        </aside>
      </section>
    </div>

    <script>
      const graphData = __GRAPH_DATA__;
      const shell = document.getElementById('svgShell');
      const svg = shell.querySelector('svg');
      const searchInput = document.getElementById('search');
      const mainPathToggle = document.getElementById('mainPathToggle');
      const clearSelectionButton = document.getElementById('clearSelection');
      const resetButton = document.getElementById('resetAll');
      const statusLine = document.getElementById('statusLine');
      const selectionTitle = document.getElementById('selectionTitle');
      const kindPill = document.getElementById('kindPill');
      const degreePill = document.getElementById('degreePill');
      const incomingList = document.getElementById('incomingList');
      const outgoingList = document.getElementById('outgoingList');

      const nodeElements = new Map();
      const edgeElements = [];

      svg.querySelectorAll('rect').forEach((rect) => {
        const title = rect.querySelector('title');
        if (!title) {
          return;
        }
        const name = title.textContent.trim();
        if (!graphData.nodes[name]) {
          return;
        }
        const label = rect.nextElementSibling && rect.nextElementSibling.tagName.toLowerCase() === 'text'
          ? rect.nextElementSibling
          : null;
        rect.classList.add('node-rect');
        rect.dataset.node = name;
        rect.tabIndex = 0;
        if (label) {
          label.classList.add('node-label');
          label.dataset.node = name;
        }
        nodeElements.set(name, { rect, label });
      });

      svg.querySelectorAll('line').forEach((line) => {
        const title = line.querySelector('title');
        if (!title) {
          return;
        }
        const text = title.textContent.trim();
        const parts = text.split(' -> ');
        if (parts.length !== 2) {
          return;
        }
        line.classList.add('edge-line');
        line.dataset.source = parts[0];
        line.dataset.target = parts[1];
        edgeElements.push(line);
      });

      let selectedNode = null;
      let searchTerm = '';
      let mainPathOnly = false;

      function listMarkup(items) {
        return items.length ? items.map((item) => `<li>${item}</li>`).join('') : '<li>None</li>';
      }

      function matchesSearch(nodeId) {
        return !searchTerm || nodeId.toLowerCase().includes(searchTerm);
      }

      function relatedToSelection(nodeId) {
        if (!selectedNode) {
          return false;
        }
        const node = graphData.nodes[selectedNode];
        return node.incoming.includes(nodeId) || node.outgoing.includes(nodeId);
      }

      function nodeVisible(nodeId) {
        return !mainPathOnly || graphData.nodes[nodeId].isMainPath;
      }

      function updateInspector() {
        if (!selectedNode) {
          selectionTitle.textContent = 'Click a node to inspect its local connections.';
          kindPill.textContent = 'Kind: none';
          degreePill.textContent = 'Degree: 0';
          incomingList.innerHTML = '<li>None</li>';
          outgoingList.innerHTML = '<li>None</li>';
          return;
        }

        const node = graphData.nodes[selectedNode];
        selectionTitle.textContent = selectedNode;
        kindPill.textContent = `Kind: ${node.kindLabel}`;
        degreePill.textContent = `Degree: ${node.incoming.length + node.outgoing.length}`;
        incomingList.innerHTML = listMarkup(node.incoming);
        outgoingList.innerHTML = listMarkup(node.outgoing);
      }

      function updateStatus() {
        const visibleNodeIds = Object.keys(graphData.nodes).filter(nodeVisible);
        const matches = visibleNodeIds.filter(matchesSearch);
        const base = '__SUMMARY__';
        if (searchTerm && !matches.length) {
          statusLine.textContent = `No nodes match "${searchInput.value}". ${base}`;
          return;
        }
        const suffix = [];
        if (mainPathOnly) {
          suffix.push('main path filter on');
        }
        if (searchTerm) {
          suffix.push(`matches: ${matches.length}`);
        }
        statusLine.textContent = suffix.length ? `${base}; ${suffix.join(', ')}` : base;
      }

      function applyState() {
        nodeElements.forEach(({ rect, label }, nodeId) => {
          const visible = nodeVisible(nodeId);
          const selected = selectedNode === nodeId;
          const neighbor = relatedToSelection(nodeId);
          const dimForSearch = searchTerm && !matchesSearch(nodeId) && !selected && !neighbor;
          const dimForSelection = selectedNode && !selected && !neighbor;

          rect.classList.toggle('hidden', !visible);
          rect.classList.toggle('selected', selected);
          rect.classList.toggle('neighbor', neighbor && !selected);
          rect.classList.toggle('muted', visible && (dimForSearch || dimForSelection));

          if (label) {
            label.classList.toggle('hidden', !visible);
            label.classList.toggle('selected', selected);
            label.classList.toggle('neighbor', neighbor && !selected);
            label.classList.toggle('muted', visible && (dimForSearch || dimForSelection));
          }
        });

        edgeElements.forEach((line) => {
          const source = line.dataset.source;
          const target = line.dataset.target;
          const visible = nodeVisible(source) && nodeVisible(target);
          const selected = selectedNode && (source === selectedNode || target === selectedNode);
          const searchRelated = !searchTerm || matchesSearch(source) || matchesSearch(target);
          line.classList.toggle('hidden', !visible);
          line.classList.toggle('active', Boolean(selected));
          line.classList.toggle('muted', visible && ((!searchRelated) || (selectedNode && !selected)));
        });

        updateInspector();
        updateStatus();
        mainPathToggle.classList.toggle('active', mainPathOnly);
      }

      nodeElements.forEach(({ rect, label }, nodeId) => {
        const selectNode = () => {
          selectedNode = nodeId;
          applyState();
        };
        rect.addEventListener('click', selectNode);
        rect.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectNode();
          }
        });
        if (label) {
          label.addEventListener('click', selectNode);
        }
      });

      searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLowerCase();
        applyState();
      });

      mainPathToggle.addEventListener('click', () => {
        mainPathOnly = !mainPathOnly;
        if (selectedNode && !nodeVisible(selectedNode)) {
          selectedNode = null;
        }
        applyState();
      });

      clearSelectionButton.addEventListener('click', () => {
        selectedNode = null;
        applyState();
      });

      resetButton.addEventListener('click', () => {
        selectedNode = null;
        searchTerm = '';
        mainPathOnly = false;
        searchInput.value = '';
        applyState();
      });

      selectedNode = 'Intracranial Pressure Changes';
      applyState();
    </script>
  </body>
</html>
"""

    html_text = (
        template.replace("__SVG__", svg_markup)
        .replace("__GRAPH_DATA__", json.dumps(payload, ensure_ascii=False))
        .replace("__SUMMARY__", html.escape(summary))
        .replace("__PDF_SOURCE__", html.escape(str(PDF_SOURCE)))
        .replace("__ROOTS__", roots_html)
        .replace("__SINKS__", sinks_html)
    )
    html_path.write_text(html_text, encoding="utf-8")


def build_report(nodes, edges, validation):
    lines = [
        "SANS Risk DAG validation report",
        "=" * 32,
        f"Source PDF: {PDF_SOURCE}",
        SOURCE_NOTE,
        "",
        f"Nodes: {len(nodes)}",
        f"Edges: {len(edges)}",
        f"Missing node references: {len(validation['missing_nodes'])}",
        f"Duplicate edges: {len(validation['duplicate_edges'])}",
        f"Self loops: {len(validation['self_loops'])}",
        f"Cycle detected: {'yes' if validation['cycle'] else 'no'}",
        f"Weakly connected components: {len(validation['components'])}",
        "",
        "Roots:",
        ", ".join(validation["roots"]),
        "",
        "Sinks:",
        ", ".join(validation["sinks"]),
        "",
        "Key path checks:",
    ]
    for label, passed in validation["path_checks"].items():
        lines.append(f"- {label}: {'yes' if passed else 'no'}")
    if validation["cycle"]:
        lines.extend(["", "Cycle example:", " -> ".join(validation["cycle"])])
    if validation["missing_nodes"]:
        lines.extend(["", "Missing references:", *validation["missing_nodes"]])
    if validation["duplicate_edges"]:
        lines.extend(
            ["", "Duplicate edges:"] + [f"- {source} -> {target}" for source, target in validation["duplicate_edges"]]
        )
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(
        description="Render the NASA SANS Risk Appendix C DAG as SVG and interactive HTML, then validate its connections."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).with_name("sans_risk_graph.svg"),
        help="SVG output path",
    )
    parser.add_argument(
        "--html-output",
        type=Path,
        default=Path(__file__).with_name("sans_risk_graph.html"),
        help="Interactive HTML output path",
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=Path(__file__).with_name("sans_risk_graph_report.txt"),
        help="Validation report output path",
    )
    parser.add_argument(
        "--open",
        action="store_true",
        help="Open the interactive HTML view in the default browser after generation",
    )
    args = parser.parse_args()

    nodes = build_nodes()
    validation = validate_graph(nodes, EDGE_SPECS)

    if validation["missing_nodes"] or validation["duplicate_edges"] or validation["self_loops"] or validation["cycle"]:
        raise SystemExit("Validation failed. See the report output for details.")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.html_output.parent.mkdir(parents=True, exist_ok=True)
    args.report.parent.mkdir(parents=True, exist_ok=True)

    render_svg(nodes, EDGE_SPECS, args.output)
    render_html(nodes, EDGE_SPECS, validation, args.output, args.html_output)
    args.report.write_text(build_report(nodes, EDGE_SPECS, validation), encoding="utf-8")

    print(f"Wrote SVG: {args.output}")
    print(f"Wrote HTML: {args.html_output}")
    print(f"Wrote report: {args.report}")
    print(f"Validated {len(nodes)} nodes and {len(EDGE_SPECS)} edges.")
    print(f"Weakly connected components: {len(validation['components'])}")

    if args.open:
        webbrowser.open(args.html_output.resolve().as_uri())


if __name__ == "__main__":
    main()
