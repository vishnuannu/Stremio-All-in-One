const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const tmdb = require("./providers/tmdb");

const PORT = Number(process.env.PORT || 7000);
const BASE_ID = "allinone:";

const movieCatalog = [
  {
    id: `${BASE_ID}big-buck-bunny`,
    type: "movie",
    name: "Big Buck Bunny",
    releaseInfo: "2008",
    description: "Open movie by the Blender Foundation. Creative Commons Attribution 3.0.",
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
    description: "Authorized Excel and VBA learning videos.",
    genres: ["Training", "Excel", "VBA"]
  },
  {
    id: `${BASE_ID}training-sap`,
    type: "series",
    name: "SAP Training",
    releaseInfo: "Learning",
    description: "Authorized SAP learning videos.",
    genres: ["Training", "SAP", "Professional Skills"]
  },
  {
    id: `${BASE_ID}learning-computer`,
    type: "series",
    name: "Computer & Technology Training",
    releaseInfo: "Learning",
    description: "Computer and technology learning resources.",
    genres: ["Training", "Computer", "Technology"]
  },
  {
    id: `${BASE_ID}free-series`,
    type: "series",
    name: "Legal Free TV & Web Series",
    releaseInfo: "Catalog",
    description: "TV and web series with verified legal free streaming sources.",
    genres: ["TV", "Web Series", "Free Legal"]
  }
];

const manifest = {
  id: "org.openai.stremio.allinone.legal",
  version: "1.1.0",
  name: "All-in-One Legal Free",
  description: "Movie and series discovery with TMDB metadata, legal free catalogs and learning resources.",
  resources: ["catalog", "meta", "stream", "subtitles"],
  types: ["movie", "series"],
  idPrefixes: [BASE_ID],
  catalogs: [
    {
      type: "movie",
      id: "legal-movies",
      name: "Movies Search",
      extra: [{ name: "search", isRequired: false }]
    },
    {
      type: "series",
      id: "legal-shows",
      name: "TV & Series Search",
      extra: [{ name: "search", isRequired: false }]
    },
    {
      type: "series",
      id: "training",
      name: "Training & Learning"
    }
  ],
  behaviorHints: {
    configurable: false,
    configurationRequired: false
  }
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra }) => {
  const search = extra && extra.search ? String(extra.search).trim() : "";

  try {
    if (id === "legal-movies" && type === "movie") {
      if (search) {
        return { metas: await tmdb.searchCatalog("movie", search) };
      }
      return { metas: movieCatalog };
    }

    if (id === "legal-shows" && type === "series") {
      if (search) {
        return { metas: await tmdb.searchCatalog("series", search) };
      }
      return {
        metas: seriesCatalog.filter(item => item.id.endsWith("free-series"))
      };
    }

    if (id === "training" && type === "series") {
      return {
        metas: seriesCatalog.filter(
          item => item.id.includes("training-") || item.id.includes("learning-")
        )
      };
    }

    return { metas: [] };
  } catch (error) {
    console.error("Catalog error:", error.message);
    return { metas: [] };
  }
});

builder.defineMetaHandler(async ({ type, id }) => {
  const tmdbMatch = id.match(/^allinone:tmdb:(movie|series):(\d+)$/);

  if (tmdbMatch && tmdbMatch[1] === type) {
    try {
      return {
        meta: await tmdb.getDetails(type, tmdbMatch[2])
      };
    } catch (error) {
      console.error("TMDB details error:", error.message);
      return { meta: null };
    }
  }

  const item = [...movieCatalog, ...seriesCatalog].find(
    entry => entry.id === id && entry.type === type
  );

  if (!item) return { meta: null };

  return {
    meta: {
      ...item,
      posterShape: "poster"
    }
  };
});

builder.defineStreamHandler(({ type, id }) => {
  if (type === "movie" && id === `${BASE_ID}big-buck-bunny`) {
    return {
      streams: [
        {
          name: "Legal demo stream",
          title: "Big Buck Bunny • 1080p sample",
          url: "https://upload.wikimedia.org/wikipedia/commons/8/88/Big_Buck_Bunny_alt.webm",
          behaviorHints: { notWebReady: false }
        }
      ]
    };
  }

  return { streams: [] };
});

builder.defineSubtitlesHandler(() => ({ subtitles: [] }));

serveHTTP(builder.getInterface(), { port: PORT });
console.log(`All-in-One Legal Free add-on listening on port ${PORT}`);
