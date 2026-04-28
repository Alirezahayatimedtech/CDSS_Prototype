# CDSS Prototype

This repo includes a hosted CDSS prototype with three workspaces: the restored Appendix C DAG catalog, the infection-risk prototype, and the new SpaceAgent research console.

[![Open DAG Catalog](https://img.shields.io/badge/Open-DAG_Catalog-0f766e?style=for-the-badge)](https://alirezahayatimedtech.github.io/CDSS_Prototype/dag-catalog/index.html)
[![Open Infection CDSS](https://img.shields.io/badge/Open-Infection_CDSS-991b1b?style=for-the-badge)](https://alirezahayatimedtech.github.io/CDSS_Prototype/?workspace=infection)
[![Open SpaceAgent](https://img.shields.io/badge/Open-SpaceAgent-0f172a?style=for-the-badge)](https://alirezahayatimedtech.github.io/CDSS_Prototype/?workspace=spaceagent)
[![Run Locally](https://img.shields.io/badge/Run-Locally-1d4ed8?style=for-the-badge)](#local-use)

Open the restored DAG catalog:

`https://alirezahayatimedtech.github.io/CDSS_Prototype/dag-catalog/index.html`

Open the infection-risk prototype directly:

`https://alirezahayatimedtech.github.io/CDSS_Prototype/?workspace=infection`

Open the SpaceAgent prototype directly:

`https://alirezahayatimedtech.github.io/CDSS_Prototype/?workspace=spaceagent`

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
- Hosted SpaceAgent URL: `https://alirezahayatimedtech.github.io/CDSS_Prototype/?workspace=spaceagent`

If the site does not publish automatically, go to `Settings -> Pages` in the GitHub repo and set the build source to `GitHub Actions`.
