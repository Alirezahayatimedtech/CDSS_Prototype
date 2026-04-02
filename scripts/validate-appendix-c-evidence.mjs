import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sansEdges, sansNodes } from '../src/sansRiskData.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const catalogPath = resolve(rootDir, 'DAG', 'data', 'dags.json');
const outputPath = resolve(rootDir, 'DAG', 'appendix_c_evidence_report.md');

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const sourceLabel = catalog.sourceNote ?? 'Appendix C DAGitty export';

function edgeKey(source, target) {
  return `${source}=>${target}`;
}

function summarizeCatalogGraphs(graphs) {
  return graphs.map((graph) => {
    const positionedNodes = graph.nodes.filter(
      (node) => Number.isFinite(node.x) && Number.isFinite(node.y)
    ).length;

    return {
      title: graph.title,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      coordinateCoverage: `${positionedNodes}/${graph.nodes.length}`,
      warnings: graph.validation?.warnings ?? [],
    };
  });
}

function compareSansWorkspace(graphs) {
  const appendixGraph = graphs.find((graph) => graph.title === 'SANS Risk');

  if (!appendixGraph) {
    throw new Error('SANS Risk graph was not found in DAG/data/dags.json.');
  }

  const appendixNodes = new Set(appendixGraph.nodes.map((node) => node.id));
  const appendixEdges = new Set(
    appendixGraph.edges.map((edge) => edgeKey(edge.source, edge.target))
  );
  const workspaceNodes = new Set(sansNodes.map((node) => node.id));
  const workspaceEdges = new Set(
    sansEdges.map((edge) => edgeKey(edge.source, edge.target))
  );

  return {
    appendixNodeCount: appendixNodes.size,
    appendixEdgeCount: appendixEdges.size,
    workspaceNodeCount: workspaceNodes.size,
    workspaceEdgeCount: workspaceEdges.size,
    extraNodes: [...workspaceNodes].filter((node) => !appendixNodes.has(node)).sort(),
    missingNodes: [...appendixNodes].filter((node) => !workspaceNodes.has(node)).sort(),
    extraEdges: [...workspaceEdges].filter((edge) => !appendixEdges.has(edge)).sort(),
    missingEdges: [...appendixEdges].filter((edge) => !workspaceEdges.has(edge)).sort(),
    speculativeEdges: sansEdges
      .filter((edge) => edge.speculative)
      .map((edge) => edgeKey(edge.source, edge.target))
      .sort(),
  };
}

function buildReport(catalogSummary, sansSummary) {
  const totalNodes = catalogSummary.reduce((sum, graph) => sum + graph.nodeCount, 0);
  const totalEdges = catalogSummary.reduce((sum, graph) => sum + graph.edgeCount, 0);
  const warningGraphs = catalogSummary.filter((graph) => graph.warnings.length);

  const lines = [
    '# Appendix C Evidence Report',
    '',
    `Source PDF: \`${catalog.sourcePdf}\``,
    `Evidence basis: ${sourceLabel}`,
    '',
    '## Catalog Summary',
    '',
    `- Graphs extracted from Appendix C: ${catalog.graphCount}`,
    `- Total nodes extracted: ${totalNodes}`,
    `- Total directed edges extracted: ${totalEdges}`,
    `- Coordinate coverage: ${catalogSummary.every((graph) => graph.coordinateCoverage === `${graph.nodeCount}/${graph.nodeCount}`) ? 'All graph nodes include Appendix C coordinates.' : 'Some graphs are missing coordinates.'}`,
    `- Validation warning count: ${warningGraphs.length} graph(s)`,
    '',
    '## Per-Graph Evidence Check',
    '',
    '| Graph | Nodes | Edges | Coordinates | Warnings |',
    '| --- | ---: | ---: | --- | --- |',
    ...catalogSummary.map((graph) => `| ${graph.title} | ${graph.nodeCount} | ${graph.edgeCount} | ${graph.coordinateCoverage} | ${graph.warnings.length ? graph.warnings.join('<br>') : 'None'} |`),
    '',
    '## Custom SANS Workspace Check',
    '',
    `- Appendix C SANS nodes: ${sansSummary.appendixNodeCount}`,
    `- Custom SANS nodes in \`src/sansRiskData.js\`: ${sansSummary.workspaceNodeCount}`,
    `- Node set match: ${sansSummary.extraNodes.length === 0 && sansSummary.missingNodes.length === 0 ? 'Yes' : 'No'}`,
    `- Appendix C SANS edges: ${sansSummary.appendixEdgeCount}`,
    `- Custom SANS edges in \`src/sansRiskData.js\`: ${sansSummary.workspaceEdgeCount}`,
    `- Edge set match: ${sansSummary.extraEdges.length === 0 && sansSummary.missingEdges.length === 0 ? 'Yes' : 'No'}`,
    `- Extra custom nodes: ${sansSummary.extraNodes.length ? sansSummary.extraNodes.join(', ') : 'None'}`,
    `- Missing Appendix C nodes: ${sansSummary.missingNodes.length ? sansSummary.missingNodes.join(', ') : 'None'}`,
    `- Extra custom edges: ${sansSummary.extraEdges.length ? sansSummary.extraEdges.join(', ') : 'None'}`,
    `- Missing Appendix C edges: ${sansSummary.missingEdges.length ? sansSummary.missingEdges.join(', ') : 'None'}`,
    `- Speculative-tagged SANS edges: ${sansSummary.speculativeEdges.length}`,
    `- Speculative-tagged edges still present in Appendix C: ${sansSummary.speculativeEdges.every((edge) => !sansSummary.extraEdges.includes(edge)) ? 'Yes' : 'No'}`,
    '',
    'Speculative in the SANS workspace is a viewer classification only. Those edges are still Appendix C-backed edges in the extracted SANS graph; they are not extra non-Appendix-C relationships.',
    '',
    '## Notes',
    '',
    '- The static DAG catalog in `DAG/data/dags.json` is Appendix C-derived content, not a hand-entered graph set.',
    '- The body of the paper contains the original styled figures; Appendix C contains the DAGitty-format source text used here for reproducible extraction and validation.',
  ];

  return `${lines.join('\n')}\n`;
}

const catalogSummary = summarizeCatalogGraphs(catalog.graphs);
const sansSummary = compareSansWorkspace(catalog.graphs);
const report = buildReport(catalogSummary, sansSummary);

writeFileSync(outputPath, report, 'utf8');

console.log(`Wrote Appendix C evidence report: ${outputPath}`);
console.log(`Graphs: ${catalog.graphCount}`);
console.log(
  `SANS node match: ${sansSummary.extraNodes.length === 0 && sansSummary.missingNodes.length === 0 ? 'yes' : 'no'}`
);
console.log(
  `SANS edge match: ${sansSummary.extraEdges.length === 0 && sansSummary.missingEdges.length === 0 ? 'yes' : 'no'}`
);
