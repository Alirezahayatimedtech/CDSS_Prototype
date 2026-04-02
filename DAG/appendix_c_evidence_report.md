# Appendix C Evidence Report

Source PDF: `HSRB/TP_Directed Acyclic Graphs_ A Tool for Understanding the nature of the NASA Human System Risks_NASA-TP-20220015709.pdf`
Evidence basis: Appendix C DAGitty export extracted from NASA-TP-20220015709. A few labels required whitespace normalization after PDF text extraction. Validation warnings are surfaced per graph.

## Catalog Summary

- Graphs extracted from Appendix C: 29
- Total nodes extracted: 1207
- Total directed edges extracted: 2108
- Coordinate coverage: All graph nodes include Appendix C coordinates.
- Validation warning count: 1 graph(s)

## Per-Graph Evidence Check

| Graph | Nodes | Edges | Coordinates | Warnings |
| --- | ---: | ---: | --- | --- |
| Acoustics Risk | 37 | 51 | 37/37 | None |
| Behavioral Risk Narrative | 39 | 63 | 39/39 | None |
| Bone Fracture Risk | 46 | 73 | 46/46 | None |
| Cardiovascular Risk | 43 | 82 | 43/43 | None |
| CO2 Risk | 39 | 66 | 39/39 | None |
| Crew Egress Risk | 44 | 87 | 44/44 | None |
| DCS Risk | 34 | 65 | 34/34 | None |
| Dust Risk | 40 | 68 | 40/40 | Cycle detected: Atmospheric Dust Level -> Detect Atmospheric Dust -> Dust Removal -> Atmospheric Dust Level |
| Dynamic Loads Risk | 32 | 55 | 32/32 | None |
| Electric Shock Risk | 44 | 77 | 44/44 | None |
| EVA Risk | 45 | 82 | 45/45 | None |
| Food and Nutrition Risk | 45 | 97 | 45/45 | None |
| HSIA Risk | 41 | 78 | 41/41 | None |
| Hypoxia Risk | 33 | 55 | 33/33 | None |
| Immune Risk | 48 | 84 | 48/48 | None |
| Medical Risk | 48 | 96 | 48/48 | None |
| Microhost Risk | 41 | 69 | 41/41 | None |
| Muscle and Aerobic Risks | 38 | 66 | 38/38 | None |
| Non-Ionizing Radiation Risk | 24 | 33 | 24/24 | None |
| Pharm Risk | 60 | 100 | 60/60 | None |
| Carcinogenesis Risk | 37 | 58 | 37/37 | None |
| Renal Stone Risk | 51 | 75 | 51/51 | None |
| SANS Risk | 50 | 90 | 50/50 | None |
| Sensorimotor Risk | 42 | 86 | 42/42 | None |
| Sleep Risk | 42 | 78 | 42/42 | None |
| Team Risk | 37 | 77 | 37/37 | None |
| Tox Risk | 44 | 85 | 44/44 | None |
| Urinary Retention Risk | 39 | 52 | 39/39 | None |
| VTE Concern | 44 | 60 | 44/44 | None |

## Custom SANS Workspace Check

- Appendix C SANS nodes: 50
- Custom SANS nodes in `src/sansRiskData.js`: 50
- Node set match: Yes
- Appendix C SANS edges: 90
- Custom SANS edges in `src/sansRiskData.js`: 90
- Edge set match: Yes
- Extra custom nodes: None
- Missing Appendix C nodes: None
- Extra custom edges: None
- Missing Appendix C edges: None
- Speculative-tagged SANS edges: 12
- Speculative-tagged edges still present in Appendix C: Yes

Speculative in the SANS workspace is a viewer classification only. Those edges are still Appendix C-backed edges in the extracted SANS graph; they are not extra non-Appendix-C relationships.

## Notes

- The static DAG catalog in `DAG/data/dags.json` is Appendix C-derived content, not a hand-entered graph set.
- The body of the paper contains the original styled figures; Appendix C contains the DAGitty-format source text used here for reproducible extraction and validation.
