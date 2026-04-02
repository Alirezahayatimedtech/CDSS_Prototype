# DAG Folder

This folder contains the Appendix C DAG catalog for the NASA Human System Risks paper.

Contents:

- `index.html`: static viewer for all Appendix C graphs
- `app.js`: client-side graph renderer and selector
- `styles.css`: viewer styles
- `data/dags.json`: generated graph dataset for all 29 Appendix C models
- `appendix_c_evidence_report.md`: provenance check showing the catalog and custom SANS workspace still match Appendix C
- `appendix_c_validation_report.txt`: validation summary across the catalog
- `generate_dag_catalog.py`: local generator that extracts graph data from the source PDF
- `archive/`: earlier standalone SANS-only artifacts kept out of the repo root

Local regeneration requires the PDF in `HSRB/` and a `pdftotext` binary available locally.

Evidence report regeneration:

```powershell
npm run validate:appendix-c-evidence
```
