const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const PORT = Number(process.env.PORT || 7000);
const BASE_ID = "allinone:";

// This first build deliberately includes one known demo stream from the
// official Stremio SDK example. Add further streams only after confirming
// the source is authorized and provides a stable direct media URL.
const movieCatalog = [
  {
    id: `${BASE_ID}big-buck-bunny`,
    type: "movie",
    name: "Big Buck Bunny",
    releaseInfo: "2008",
    description:
      "Open movie by the Blender Foundation. Creative Commons Attribution 3.0. " +
      "Demo stream supplied in the official Stremio Add-on SDK example.",
    genres: ["Animation", "Family", "Open Movie"],
    runtime: "00:10:34",
    language: "English (original)"
  }
];

const seriesCatalog = [
  {
    id: `${BASE_ID}training-excel`,
    type: "series",
    name: "Excel & VBA Training",
    releaseInfo: "Learning",
    description:
      "Learning catalog placeholder. Authorized lesson video URLs can be added in a later build.",
    genres: ["Training", "Excel", "VBA"]
  },
  {
    id: `${BASE_ID}training-sap`,
    type: "series",
    name: "SAP Training",
    releaseInfo: "Learning",
    description:
      "Learning catalog placeholder. Authorized lesson video URLs can be added in a later build.",
    genres: ["Training", "SAP", "Professional Skills"]
  },
  {
    id: `${BASE_ID}learning-computer`,
    type: "series",
    name: "Computer & Technology Training",
    releaseInfo: "Learning",
    description:
      "Learning catalog placeholder. Authorized lesson video URLs can be added in a later build.",
    genres: ["Training", "Computer", "Technology"]
  },
  {
    id: `${BASE_ID}free-series`,
    type: "series",
    name: "Legal Free TV & Web Series",
    releaseInfo: "Catalog",
    description:
      "Catalog section reserved for TV and web series with verified legal free streaming sources.",
    genres: ["TV", "Web Series", "Free Legal"]
  }
];

const manifest = {
  id: "org.openai.stremio.allinone.legal",
  version: "1.0.0",
  name: "All-in-One Legal Free",
  description:
    "Legal free movies, TV and learning catalogs. Includes one authorized demo movie stream.",
  resources: ["catalog", "meta", "stream", "subtitles"],
  types: ["movie", "series"],
  idPrefixes: [BASE_ID],
  catalogs: [
    { type: "movie", id: "legal-movies", name: "Legal Free Movies" },
    { type: "series", id: "legal-shows", name: "Legal Free TV & Shows" },
    { type: "series", id: "training", name: "Training & Learning" }
  ],
  behaviorHints: {
    configurable: false,
    configurationRequired: false
  }
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(({ type, id, extra }) => {
  const search = (extra && extra.search) ? String(extra.search).toLowerCase() : "";
  let items = [];

  if (id === "legal-movies" && type === "movie") {
    items = movieCatalog;
  } else if (id === "legal-shows" && type === "series") {
    items = seriesCatalog.filter((item) => item.id.endsWith("free-series"));
  } else if (id === "training" && type === "series") {
    items = seriesCatalog.filter((item) => item.id.includes("training-") || item.id.includes("learning-"));
  }

  if (search) {
    items = items.filter((item) =>
      `${item.name} ${item.description || ""} ${(item.genres || []).join(" ")}`
        .toLowerCase()
        .includes(search)
    );
  }

  return Promise.resolve({ metas: items });
});

builder.defineMetaHandler(({ type, id }) => {
  const item = [...movieCatalog, ...seriesCatalog].find(
    (entry) => entry.id === id && entry.type === type
  );
  if (!item) return Promise.resolve({ meta: null });

  return Promise.resolve({
    meta: {
      ...item,
      poster: undefined,
      background: undefined,
      posterShape: "landscape"
    }
  });
});

builder.defineStreamHandler(({ type, id }) => {
  if (type === "movie" && id === `${BASE_ID}big-buck-bunny`) {
    return Promise.resolve({
      streams: [
        {
          name: "Legal demo stream",
          title: "Big Buck Bunny • 1080p sample",
          url: "http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4",
          behaviorHints: {
            notWebReady: false
          }
        }
      ]
    });
  }

  // No fabricated or unverified links: other catalog entries remain
  // browseable until an authorized direct-playback source is configured.
  return Promise.resolve({ streams: [] });
});

builder.defineSubtitlesHandler(() => Promise.resolve({ subtitles: [] }));

serveHTTP(builder.getInterface(), { port: PORT });
console.log(`All-in-One Legal Free add-on listening on port ${PORT}`);
