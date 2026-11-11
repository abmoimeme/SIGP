# SIGP – Système Intégré de Gestion des Plaintes

Prototype indépendant et **non officiel**, avec des **données fictives**, développé par Nioro Resources LLC.
Il illustre une plateforme nationale de réception, suivi, enquête et reporting des plaintes citoyens pour la Police nationale et la Gendarmerie nationale du Sénégal.

*Independent, unofficial prototype with fictional data (Nioro Resources LLC): complaint intake, case tracking, audit trail, dashboards and role-based access for Senegal's Police and Gendarmerie.*

## Contenu
- `prototype/` : prototype v4.1 (HTML/JS autonome, `index.html`). Ouvrir via un petit serveur local, ex. `cd prototype && python3 -m http.server 8000`.
- `docs/` : notes de version, modèle d'accès, terminologie, revues.
- `video/` : script de lecture, sous-titres FR, scripts de montage/voix off (`tts.py`, `build.py`). Les vidéos MP4 sont publiées dans *Releases*, pas dans le dépôt.

## Statut
Prototype de démonstration : stockage local navigateur, aucune donnée réelle, aucune affiliation officielle.

## Stockage partagé (Firebase)
`prototype/firebase-sync.js` synchronise l'état de démonstration avec une Realtime Database Firebase (REST). Données fictives uniquement ; sans accès réseau, le prototype reste en stockage navigateur. Ajouter `?local=1` à l'URL désactive la synchronisation. Mode « dernier écrit gagne », sans authentification : prototype uniquement. Les règles de la base doivent limiter l'écriture au nœud `sigp-demo`.
