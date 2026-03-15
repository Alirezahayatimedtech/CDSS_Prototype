# CDSS Prototype

This repo includes an integrated Appendix C DAG viewer for all 29 NASA Human System Risk models.

[![Open Viewer](https://img.shields.io/badge/Open-Appendix_C_DAG_Viewer-0f766e?style=for-the-badge)](https://alirezahayatimedtech.github.io/CDSS_Prototype/)

Open in browser:

`https://alirezahayatimedtech.github.io/CDSS_Prototype/`

Repo folder:

`DAG/`

Local use:

```powershell
python DAG\generate_dag_catalog.py
python -m http.server 8000 -d DAG
```

GitHub Pages:

- Workflow: `.github/workflows/deploy-pages.yml`
- Expected site URL after Pages is enabled: `https://alirezahayatimedtech.github.io/CDSS_Prototype/`

If the site does not publish automatically, go to `Settings -> Pages` in the GitHub repo and set the build source to `GitHub Actions`.
