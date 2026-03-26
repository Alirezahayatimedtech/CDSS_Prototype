# CDSS Prototype

This repo includes a hosted CDSS prototype with two workspaces: the restored Appendix C DAG catalog and the infection-risk prototype.

[![Open DAG Catalog](https://img.shields.io/badge/Open-DAG_Catalog-0f766e?style=for-the-badge)](https://alirezahayatimedtech.github.io/CDSS_Prototype/dag-catalog/index.html)
[![Open Infection CDSS](https://img.shields.io/badge/Open-Infection_CDSS-991b1b?style=for-the-badge)](https://alirezahayatimedtech.github.io/CDSS_Prototype/?workspace=infection)
[![Run Locally](https://img.shields.io/badge/Run-Locally-1d4ed8?style=for-the-badge)](#local-use)

Open the restored DAG catalog:

`https://alirezahayatimedtech.github.io/CDSS_Prototype/dag-catalog/index.html`

Open the infection-risk prototype directly:

`https://alirezahayatimedtech.github.io/CDSS_Prototype/?workspace=infection`

Repo folder:

`DAG/`

## Local Use

```powershell
npm install
npm run dev
```

Then open:

`http://localhost:5173`

## DAG-Only Local Use

```powershell
python DAG\generate_dag_catalog.py
python -m http.server 8000 -d DAG
```

GitHub Pages:

- Workflow: `.github/workflows/deploy-pages.yml`
- Hosted DAG catalog URL: `https://alirezahayatimedtech.github.io/CDSS_Prototype/dag-catalog/index.html`
- Hosted Infection CDSS URL: `https://alirezahayatimedtech.github.io/CDSS_Prototype/?workspace=infection`

If the site does not publish automatically, go to `Settings -> Pages` in the GitHub repo and set the build source to `GitHub Actions`.
