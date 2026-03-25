# CDSS Prototype

This repo includes a hosted CDSS prototype with two workspaces: the Appendix C SANS DAG explorer and the infection-risk prototype.

[![Open CDSS Prototype](https://img.shields.io/badge/Open-CDSS_Prototype-0f766e?style=for-the-badge)](https://alirezahayatimedtech.github.io/CDSS_Prototype/)
[![Run Locally](https://img.shields.io/badge/Run-Locally-1d4ed8?style=for-the-badge)](#local-use)

Open in browser:

`https://alirezahayatimedtech.github.io/CDSS_Prototype/`

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
- Hosted app URL: `https://alirezahayatimedtech.github.io/CDSS_Prototype/`

If the site does not publish automatically, go to `Settings -> Pages` in the GitHub repo and set the build source to `GitHub Actions`.
