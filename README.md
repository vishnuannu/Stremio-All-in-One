# Stremio All-in-One Legal Free — v1.0

A starter Stremio add-on with separate catalogs for:
- Legal free movies
- Legal free TV/web series (catalog placeholder until verified sources are added)
- Training: Excel/VBA, SAP, and computer/technology (catalog placeholders)

## Included working playback test

The first build includes **Big Buck Bunny**, an open movie from the Blender Foundation, using the sample stream URL shown in the official Stremio Add-on SDK README. Verify playback and source availability in your region before relying on it.

Other entries intentionally have no stream URL yet. The add-on does not scrape piracy sites, bypass subscriptions, or claim that a catalog entry is playable when no authorized direct media source has been configured.

## Run locally

Requirements: Node.js 18+

```bash
npm install
npm start
```

Open this URL in Stremio (replace localhost only if running on another device):
`http://127.0.0.1:7000/manifest.json`

For Android, local `127.0.0.1` refers to the phone itself. To install on an Android phone, deploy this add-on to a public HTTPS host first.

## Deploy free with Render

1. Create a GitHub repository and upload these project files.
2. In Render, choose **New → Blueprint** and connect that repository.
3. Render reads `render.yaml`; select the Free plan and deploy.
4. After deployment, open `https://YOUR-SERVICE.onrender.com/manifest.json`.
5. In Stremio Android: Add-ons → Add Add-on (or paste the manifest URL in the add-on install flow).

Free Render web services sleep after 15 minutes without inbound traffic and can take about a minute to wake. The free tier is intended for testing/hobby use, not guaranteed always-on production hosting. Do not host video files on this service; it should only return catalog/metadata/stream links.

## Next development steps

1. Add only verified, authorized direct media URLs for movies and episodes.
2. Add official learning-video sources with permission to embed/stream.
3. Add subtitle sources only where redistribution/serving is authorized.
4. Add real Hindi/multi-audio and 4K/3D metadata only when the source confirms those tracks/formats.
5. Test every stream on Stremio Android before publishing.

## Useful official references

- Stremio Add-on SDK: https://github.com/Stremio/stremio-addon-sdk
- SDK guide: https://stremio.github.io/stremio-addon-guide/
- Render free services: https://render.com/docs/free
