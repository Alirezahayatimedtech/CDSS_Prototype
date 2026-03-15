#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
from collections import defaultdict, deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PDF = ROOT / "HSRB" / "TP_Directed Acyclic Graphs_ A Tool for Understanding the nature of the NASA Human System Risks_NASA-TP-20220015709.pdf"
DEFAULT_JSON = ROOT / "DAG" / "data" / "dags.json"
DEFAULT_REPORT = ROOT / "DAG" / "appendix_c_validation_report.txt"

APPENDIX_C_TITLES = [
    "Acoustics Risk",
    "Behavioral Risk Narrative",
    "Bone Fracture Risk",
    "Cardiovascular Risk",
    "CO2 Risk",
    "Crew Egress Risk",
    "DCS Risk",
    "Dust Risk",
    "Dynamic Loads Risk",
    "Electric Shock Risk",
    "EVA Risk",
    "Food and Nutrition Risk",
    "HSIA Risk",
    "Hypoxia Risk",
    "Immune Risk",
    "Medical Risk",
    "Microhost Risk",
    "Muscle and Aerobic Risks",
    "Non-Ionizing Radiation Risk",
    "Pharm Risk",
    "Carcinogenesis Risk",
    "Renal Stone Risk",
    "SANS Risk",
    "Sensorimotor Risk",
    "Sleep Risk",
    "Team Risk",
    "Tox Risk",
    "Urinary Retention Risk",
    "VTE Concern",
]

KIND_LABELS = {
    "default": "Operational / clinical",
    "exposure": "Exposure",
    "latent": "Latent / linked risk",
    "outcome": "Outcome",
}


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value


def find_pdftotext() -> str:
    candidates = [
        shutil.which("pdftotext"),
        ROOT / "pdftotext.exe",
        Path(r"C:\Users\AlphaH\AppData\Local\Programs\MiKTeX\miktex\bin\x64\pdftotext.exe"),
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(candidate)
    raise FileNotFoundError("pdftotext was not found. Install it or add it to PATH.")


def extract_raw_text(pdf_path: Path) -> str:
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF source not found: {pdf_path}")
    exe = find_pdftotext()
    result = subprocess.run(
        [exe, "-raw", str(pdf_path), "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore",
        check=True,
    )
    return result.stdout


def normalize_label(label: str) -> str:
    label = label.strip().replace('"', "").replace("<", "")
    label = re.sub(r"(?<=\w)-\s+(?=\w)", "-", label)
    label = re.sub(r"\s+", " ", label).strip()
    return label


def collect_statements(block: str, title: str) -> list[str]:
    lines = [line.strip().replace("\x0c", "") for line in block.splitlines()]
    statements: list[str] = []
    buffer = ""

    for line in lines:
        if not line:
            continue
        if line == title or "Appendix C" in line or line.isdigit() or "MiKTeX requires" in line:
            continue

        piece = " ".join(line.split())
        if piece.startswith("[") and not buffer:
            continue

        buffer = piece if not buffer else f"{buffer} {piece}"
        quote_count = buffer.count('"')

        if buffer in {"dag {", "}"}:
            statements.append(buffer)
            buffer = ""
            continue

        if "->" in buffer:
            if not buffer.endswith("->") and quote_count % 2 == 0:
                statements.append(buffer)
                buffer = ""
            continue

        if "[" in buffer and "]" in buffer and quote_count % 2 == 0:
            statements.append(buffer)
            buffer = ""
            continue

        if buffer.startswith("bb=") and quote_count % 2 == 0:
            statements.append(buffer)
            buffer = ""

    return statements


def parse_block(title: str, block: str) -> dict:
    node_pattern = re.compile(r'^(?P<label>.+?)\s*\[(?P<attrs>.+)\]$')
    edge_pattern = re.compile(r'^(?P<source>.+?)\s*->\s*(?P<target>.+)$')

    nodes = []
    edges = []

    for statement in collect_statements(block, title):
        if statement in {"dag {", "}"} or statement.startswith("bb="):
            continue

        node_match = node_pattern.match(statement)
        if node_match and "->" not in statement:
            attrs = node_match.group("attrs").replace(" ", "")
            position = re.search(r'pos="([^"]+)"', attrs)
            if not position:
                continue

            kind = "default"
            if attrs.startswith("exposure,") or attrs == "exposure":
                kind = "exposure"
            elif attrs.startswith("latent,") or attrs == "latent":
                kind = "latent"
            elif attrs.startswith("outcome,") or attrs == "outcome":
                kind = "outcome"

            x_pos, y_pos = [float(value) for value in position.group(1).split(",")]
            nodes.append(
                {
                    "id": normalize_label(node_match.group("label")),
                    "kind": kind,
                    "kindLabel": KIND_LABELS[kind],
                    "x": x_pos,
                    "y": y_pos,
                }
            )
            continue

        edge_match = edge_pattern.match(statement)
        if edge_match:
            edges.append(
                {
                    "source": normalize_label(edge_match.group("source")),
                    "target": normalize_label(edge_match.group("target")),
                }
            )
            continue

        raise ValueError(f"Unparsed statement in {title}: {statement}")

    return {"title": title, "slug": slugify(title), "nodes": nodes, "edges": edges}


def find_cycle(node_ids: list[str], adjacency: dict[str, list[str]]) -> list[str]:
    state: dict[str, int] = {}
    stack: list[str] = []
    cycle: list[str] = []

    def dfs(node: str) -> bool:
        state[node] = 1
        stack.append(node)
        for neighbor in adjacency.get(node, []):
            if state.get(neighbor) == 1:
                start = stack.index(neighbor)
                cycle.extend(stack[start:] + [neighbor])
                return True
            if state.get(neighbor, 0) == 0 and dfs(neighbor):
                return True
        stack.pop()
        state[node] = 2
        return False

    for node in node_ids:
        if state.get(node, 0) == 0 and dfs(node):
            break

    return cycle


def validate_graph(graph: dict) -> dict:
    node_ids = [node["id"] for node in graph["nodes"]]
    node_set = set(node_ids)
    missing_refs = sorted(
        {
            ref
            for edge in graph["edges"]
            for ref in (edge["source"], edge["target"])
            if ref not in node_set
        }
    )
    duplicate_edges = sorted(
        {
            (edge["source"], edge["target"])
            for edge in graph["edges"]
            if sum(
                1
                for candidate in graph["edges"]
                if candidate["source"] == edge["source"] and candidate["target"] == edge["target"]
            )
            > 1
        }
    )

    outgoing: dict[str, list[str]] = defaultdict(list)
    incoming: dict[str, list[str]] = defaultdict(list)
    undirected: dict[str, set[str]] = defaultdict(set)

    for edge in graph["edges"]:
        outgoing[edge["source"]].append(edge["target"])
        incoming[edge["target"]].append(edge["source"])
        undirected[edge["source"]].add(edge["target"])
        undirected[edge["target"]].add(edge["source"])

    cycle = [] if missing_refs else find_cycle(node_ids, outgoing)

    components = 0
    seen: set[str] = set()
    for node in node_ids:
        if node in seen:
            continue
        components += 1
        queue = deque([node])
        seen.add(node)
        while queue:
            current = queue.popleft()
            for neighbor in undirected.get(current, set()):
                if neighbor not in seen:
                    seen.add(neighbor)
                    queue.append(neighbor)

    roots = sorted(node for node in node_ids if not incoming.get(node))
    sinks = sorted(node for node in node_ids if not outgoing.get(node))

    warnings = []
    if missing_refs:
        warnings.append(f"Missing node references: {', '.join(missing_refs)}")
    if duplicate_edges:
        warnings.append(f"Duplicate edges: {len(duplicate_edges)}")
    if cycle:
        warnings.append(f"Cycle detected: {' -> '.join(cycle)}")
    if components > 1:
        warnings.append(f"Disconnected components: {components}")

    return {
        "nodeCount": len(graph["nodes"]),
        "edgeCount": len(graph["edges"]),
        "missingRefs": missing_refs,
        "duplicateEdges": [list(edge) for edge in duplicate_edges],
        "cycle": cycle,
        "components": components,
        "roots": roots,
        "sinks": sinks,
        "warnings": warnings,
    }


def build_catalog(text: str) -> dict:
    start_anchor = text.find("Acoustics Risk\ndag {")
    if start_anchor < 0:
        raise ValueError("Could not find the Appendix C Acoustics DAG block.")

    positions = []
    for title in APPENDIX_C_TITLES:
        position = text.find(title, start_anchor)
        if position < 0:
            raise ValueError(f"Could not find Appendix C block for: {title}")
        positions.append((position, title))
    positions.sort()

    graphs = []
    for index, (position, title) in enumerate(positions):
        next_position = positions[index + 1][0] if index + 1 < len(positions) else len(text)
        block = text[position:next_position]
        graph = parse_block(title, block)
        graph["validation"] = validate_graph(graph)
        graphs.append(graph)

    return {
        "sourcePdf": str(DEFAULT_PDF.relative_to(ROOT)).replace("\\", "/"),
        "sourceNote": (
            "Appendix C DAGitty export extracted from NASA-TP-20220015709. "
            "A few labels required whitespace normalization after PDF text extraction. "
            "Validation warnings are surfaced per graph."
        ),
        "graphCount": len(graphs),
        "graphs": graphs,
    }


def build_report(catalog: dict) -> str:
    lines = [
        "Appendix C DAG catalog validation report",
        "=======================================",
        f"Source PDF: {catalog['sourcePdf']}",
        f"Total graphs: {catalog['graphCount']}",
        "",
    ]

    for graph in catalog["graphs"]:
        validation = graph["validation"]
        lines.extend(
            [
                graph["title"],
                f"  Nodes: {validation['nodeCount']}",
                f"  Edges: {validation['edgeCount']}",
                f"  Components: {validation['components']}",
                f"  Missing refs: {len(validation['missingRefs'])}",
                f"  Cycle detected: {'yes' if validation['cycle'] else 'no'}",
            ]
        )
        if validation["warnings"]:
            lines.append("  Warnings:")
            lines.extend(f"    - {warning}" for warning in validation["warnings"])
        lines.append("")

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a normalized Appendix C DAG catalog for the CDSS repo.")
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF, help="Path to the NASA TP PDF")
    parser.add_argument("--output-json", type=Path, default=DEFAULT_JSON, help="Catalog JSON output path")
    parser.add_argument("--output-report", type=Path, default=DEFAULT_REPORT, help="Validation report output path")
    args = parser.parse_args()

    raw_text = extract_raw_text(args.pdf)
    catalog = build_catalog(raw_text)

    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_report.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(catalog, indent=2), encoding="utf-8")
    args.output_report.write_text(build_report(catalog), encoding="utf-8")

    print(f"Wrote catalog JSON: {args.output_json}")
    print(f"Wrote validation report: {args.output_report}")
    print(f"Graphs: {catalog['graphCount']}")


if __name__ == "__main__":
    main()
