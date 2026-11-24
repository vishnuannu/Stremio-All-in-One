const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

async function tmdbRequest(path) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not configured");

  const separator = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}${path}${separator}api_key=${encodeURIComponent(apiKey)}`;

  let lastError;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`TMDB request failed: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      console.error(`TMDB attempt ${attempt}/4 failed:`, error.message);

      if (attempt < 4) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1500));
      }
    }
  }

  throw lastError;
}

function ratingDescription(item) {
  const rating = Number(item.vote_average);
  const votes = Number(item.vote_count);

  if (!votes || !rating) return "TMDB Rating: Not available";

  return `TMDB Rating: ${rating.toFixed(1)}/10 | Votes: ${votes.toLocaleString("en-IN")}`;
}

function buildDescription(item) {
  return `${ratingDescription(item)}\n\n${item.overview || "Description unavailable"}`;
}

async function searchCatalog(type, query) {
  if (!query || !query.trim()) return [];

  const isMovie = type === "movie";
  const endpoint = isMovie ? "/search/movie" : "/search/tv";

  const data = await tmdbRequest(
    `${endpoint}?query=${encodeURIComponent(query.trim())}&include_adult=false`
  );

  return (data.results || []).map(item => ({
    id: `allinone:tmdb:${type}:${item.id}`,
    type,
    name: isMovie ? item.title : item.name,
    poster: item.poster_path
      ? `${IMAGE_BASE}/w500${item.poster_path}`
      : undefined,
    background: item.backdrop_path
      ? `${IMAGE_BASE}/w1280${item.backdrop_path}`
      : undefined,
    description: buildDescription(item),
    releaseInfo: ((isMovie ? item.release_date : item.first_air_date) || "").slice(0, 4),
    genres: [],
    posterShape: "poster"
  }));
}

async function getDetails(type, tmdbId) {
  const endpointType = type === "movie" ? "movie" : "tv";
  const data = await tmdbRequest(`/${endpointType}/${tmdbId}`);
  const isMovie = type === "movie";

  return {
    id: `allinone:tmdb:${type}:${tmdbId}`,
    type,
    name: isMovie ? data.title : data.name,
    poster: data.poster_path
      ? `${IMAGE_BASE}/w500${data.poster_path}`
      : undefined,
    background: data.backdrop_path
      ? `${IMAGE_BASE}/w1280${data.backdrop_path}`
      : undefined,
    description: buildDescription(data),
    releaseInfo: ((isMovie ? data.release_date : data.first_air_date) || "").slice(0, 4),
    genres: (data.genres || []).map(genre => genre.name),
    runtime: isMovie
      ? (data.runtime ? `${data.runtime} min` : undefined)
      : (data.episode_run_time && data.episode_run_time.length
          ? `${data.episode_run_time[0]} min per episode`
          : undefined),
    posterShape: "poster"
  };
}

module.exports = { searchCatalog, getDetails };
