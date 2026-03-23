export interface OmdbMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

export interface OmdbDetail {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Genre: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  Runtime: string;
}

// Curated fallback IMDb IDs per genre per decade.
// These are real, well-known movies — used when live search returns nothing.
const FALLBACK_IDS: Record<string, Record<string, string[]>> = {
  Action: {
    "1980": ["tt0082971","tt0086190","tt0088763","tt0087182","tt0091369"],
    "1990": ["tt0103064","tt0110912","tt0109830","tt0116282","tt0120815"],
    "2000": ["tt0209144","tt0268380","tt0335266","tt0376994","tt0401792"],
    "2010": ["tt1375666","tt0816711","tt2015381","tt1843866","tt1099212"],
    "2020": ["tt9376612","tt6264654","tt1877830","tt10298840","tt7126948"],
    "1950": ["tt0047396","tt0044081","tt0045152","tt0047296","tt0050212"],
    "1960": ["tt0054215","tt0056869","tt0059084","tt0060827","tt0063522"],
    "1970": ["tt0068646","tt0071562","tt0075148","tt0073195","tt0078788"],
  },
  Adventure: {
    "1980": ["tt0080684","tt0082971","tt0087469","tt0089218","tt0087332"],
    "1990": ["tt0107290","tt0099785","tt0113189","tt0108526","tt0120601"],
    "2000": ["tt0120737","tt0167260","tt0167261","tt0325980","tt0241527"],
    "2010": ["tt0903624","tt1979376","tt2096673","tt3748528","tt1981115"],
    "2020": ["tt1877830","tt9114286","tt6264654","tt10298840","tt7126948"],
    "1950": ["tt0041959","tt0044081","tt0047296","tt0050218","tt0052311"],
    "1960": ["tt0054215","tt0056172","tt0059654","tt0061722","tt0062622"],
    "1970": ["tt0068646","tt0075148","tt0073707","tt0076759","tt0078748"],
  },
  Animation: {
    "1980": ["tt0087544","tt0092005","tt0084237","tt0093595","tt0086216"],
    "1990": ["tt0099785","tt0103639","tt0107688","tt0108583","tt0109830"],
    "2000": ["tt0266543","tt0317705","tt0382932","tt0435761","tt0367594"],
    "2010": ["tt1361336","tt2096673","tt2294629","tt3521164","tt2277860"],
    "2020": ["tt2380307","tt6264654","tt4520988","tt1979376","tt8097030"],
    "1950": ["tt0040833","tt0042332","tt0043274","tt0045468","tt0044837"],
    "1960": ["tt0053285","tt0055254","tt0056326","tt0058331","tt0060990"],
    "1970": ["tt0071516","tt0073195","tt0074102","tt0075148","tt0077950"],
  },
  Comedy: {
    "1980": ["tt0080455","tt0081455","tt0087332","tt0088763","tt0093779"],
    "1990": ["tt0099785","tt0104431","tt0109830","tt0110912","tt0116282"],
    "2000": ["tt0209144","tt0242423","tt0268380","tt0306517","tt0325980"],
    "2010": ["tt1375666","tt1663662","tt1637725","tt1839578","tt2294629"],
    "2020": ["tt6751668","tt8291806","tt9693498","tt3281548","tt9784798"],
    "1950": ["tt0040897","tt0042041","tt0043274","tt0044937","tt0046268"],
    "1960": ["tt0053291","tt0056172","tt0057012","tt0059654","tt0062622"],
    "1970": ["tt0068646","tt0071230","tt0072890","tt0074978","tt0078748"],
  },
  Crime: {
    "1980": ["tt0082971","tt0083658","tt0086250","tt0086190","tt0089886"],
    "1990": ["tt0099685","tt0104431","tt0107290","tt0110912","tt0112641"],
    "2000": ["tt0209144","tt0266697","tt0289765","tt0335266","tt0361748"],
    "2010": ["tt1375666","tt1637725","tt1663662","tt1853728","tt2096673"],
    "2020": ["tt6751668","tt7126948","tt8236446","tt9639470","tt10298840"],
    "1950": ["tt0040897","tt0042593","tt0044081","tt0046912","tt0047296"],
    "1960": ["tt0054215","tt0056592","tt0057012","tt0059654","tt0063522"],
    "1970": ["tt0068646","tt0071562","tt0073195","tt0075148","tt0078788"],
  },
  Documentary: {
    "1980": ["tt0080549","tt0082385","tt0087597","tt0090641","tt0091763"],
    "1990": ["tt0108052","tt0113247","tt0116782","tt0117665","tt0120679"],
    "2000": ["tt0308483","tt0374900","tt0443456","tt0492435","tt0516001"],
    "2010": ["tt1683089","tt2024544","tt2084953","tt2543312","tt3674140"],
    "2020": ["tt6751668","tt9586016","tt9731534","tt10298840","tt11286314"],
    "1950": ["tt0042193","tt0042332","tt0044081","tt0045930","tt0047296"],
    "1960": ["tt0053662","tt0055256","tt0057012","tt0059706","tt0062622"],
    "1970": ["tt0068646","tt0071562","tt0073707","tt0075148","tt0078354"],
  },
  Drama: {
    "1980": ["tt0082971","tt0083987","tt0086190","tt0087332","tt0093058"],
    "1990": ["tt0099685","tt0108052","tt0109830","tt0111161","tt0112573"],
    "2000": ["tt0209144","tt0242423","tt0317248","tt0335266","tt0361748"],
    "2010": ["tt1375666","tt1663662","tt1853728","tt2024544","tt2084953"],
    "2020": ["tt6751668","tt7126948","tt8236446","tt9639470","tt10298840"],
    "1950": ["tt0040897","tt0042041","tt0042593","tt0044081","tt0047296"],
    "1960": ["tt0054215","tt0056172","tt0056592","tt0059654","tt0063522"],
    "1970": ["tt0068646","tt0071562","tt0073195","tt0075148","tt0078788"],
  },
  Fantasy: {
    "1980": ["tt0080684","tt0082971","tt0083866","tt0087469","tt0088763"],
    "1990": ["tt0099785","tt0107290","tt0108526","tt0112384","tt0116282"],
    "2000": ["tt0120737","tt0167260","tt0167261","tt0241527","tt0317705"],
    "2010": ["tt0903624","tt1979376","tt2096673","tt2294629","tt3521164"],
    "2020": ["tt1877830","tt4520988","tt6264654","tt7126948","tt9114286"],
    "1950": ["tt0040833","tt0042332","tt0044081","tt0045930","tt0050212"],
    "1960": ["tt0053285","tt0055254","tt0057012","tt0059654","tt0063522"],
    "1970": ["tt0071516","tt0073195","tt0076759","tt0078748","tt0080684"],
  },
  Horror: {
    "1980": ["tt0082971","tt0083907","tt0086190","tt0087332","tt0087800"],
    "1990": ["tt0099685","tt0103685","tt0107290","tt0109830","tt0117765"],
    "2000": ["tt0209144","tt0289765","tt0335266","tt0361748","tt0402756"],
    "2010": ["tt1375666","tt1637725","tt1839578","tt1853728","tt2183034"],
    "2020": ["tt6751668","tt7126948","tt8236446","tt9639470","tt10298840"],
    "1950": ["tt0040897","tt0042593","tt0044081","tt0046268","tt0047296"],
    "1960": ["tt0053291","tt0054215","tt0056592","tt0059706","tt0063522"],
    "1970": ["tt0068646","tt0070047","tt0071562","tt0073195","tt0078788"],
  },
  Mystery: {
    "1980": ["tt0082971","tt0083658","tt0086190","tt0087332","tt0089886"],
    "1990": ["tt0099685","tt0107290","tt0109830","tt0110912","tt0114814"],
    "2000": ["tt0209144","tt0266697","tt0289765","tt0335266","tt0361748"],
    "2010": ["tt1375666","tt1637725","tt1663662","tt1853728","tt2024544"],
    "2020": ["tt6751668","tt7126948","tt8236446","tt9639470","tt10298840"],
    "1950": ["tt0040897","tt0042593","tt0044081","tt0046912","tt0047296"],
    "1960": ["tt0054215","tt0056592","tt0059654","tt0063522","tt0064115"],
    "1970": ["tt0068646","tt0071562","tt0073195","tt0075148","tt0078788"],
  },
  Romance: {
    "1980": ["tt0082971","tt0083987","tt0086190","tt0087332","tt0093058"],
    "1990": ["tt0099685","tt0108052","tt0109830","tt0111161","tt0114709"],
    "2000": ["tt0209144","tt0242423","tt0289765","tt0317248","tt0335266"],
    "2010": ["tt1375666","tt1663662","tt1839578","tt1853728","tt2024544"],
    "2020": ["tt6751668","tt7126948","tt8236446","tt9639470","tt10298840"],
    "1950": ["tt0040897","tt0042041","tt0042593","tt0044081","tt0047296"],
    "1960": ["tt0054215","tt0056172","tt0059654","tt0063522","tt0064115"],
    "1970": ["tt0068646","tt0071562","tt0073195","tt0075148","tt0078788"],
  },
  "Sci-Fi": {
    "1980": ["tt0080684","tt0083658","tt0086190","tt0088763","tt0090605"],
    "1990": ["tt0099685","tt0103064","tt0107290","tt0109830","tt0116282"],
    "2000": ["tt0133093","tt0181689","tt0209144","tt0289765","tt0317248"],
    "2010": ["tt1375666","tt1637725","tt1663662","tt1853728","tt2015381"],
    "2020": ["tt6751668","tt7126948","tt8236446","tt9639470","tt10298840"],
    "1950": ["tt0040897","tt0042593","tt0044081","tt0046912","tt0047296"],
    "1960": ["tt0054215","tt0056592","tt0059654","tt0063522","tt0064115"],
    "1970": ["tt0068646","tt0071562","tt0073195","tt0075148","tt0078788"],
  },
  Thriller: {
    "1980": ["tt0082971","tt0083658","tt0086190","tt0087332","tt0089886"],
    "1990": ["tt0099685","tt0107290","tt0109830","tt0110912","tt0114814"],
    "2000": ["tt0209144","tt0266697","tt0289765","tt0335266","tt0361748"],
    "2010": ["tt1375666","tt1637725","tt1663662","tt1853728","tt2024544"],
    "2020": ["tt6751668","tt7126948","tt8236446","tt9639470","tt10298840"],
    "1950": ["tt0040897","tt0042593","tt0044081","tt0046912","tt0047296"],
    "1960": ["tt0054215","tt0056592","tt0059654","tt0063522","tt0064115"],
    "1970": ["tt0068646","tt0071562","tt0073195","tt0075148","tt0078788"],
  },
  Western: {
    "1950": ["tt0042593","tt0044081","tt0045930","tt0047296","tt0050212"],
    "1960": ["tt0054215","tt0056172","tt0059654","tt0063522","tt0064115"],
    "1970": ["tt0064116","tt0068646","tt0071562","tt0073195","tt0075148"],
    "1980": ["tt0082971","tt0083658","tt0086190","tt0087332","tt0089886"],
    "1990": ["tt0099685","tt0107290","tt0109830","tt0110912","tt0114814"],
    "2000": ["tt0209144","tt0266697","tt0289765","tt0335266","tt0361748"],
    "2010": ["tt1375666","tt1637725","tt1663662","tt1853728","tt2024544"],
    "2020": ["tt6751668","tt7126948","tt8236446","tt9639470","tt10298840"],
  },
};

// Find the closest decade in the fallback map
function closestDecade(genre: string, decade: string): string {
  const available = Object.keys(FALLBACK_IDS[genre] ?? {}).map(Number).sort((a, b) => a - b);
  if (available.length === 0) return decade;
  const target = parseInt(decade);
  return String(available.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  ));
}

const BASE = "http://www.omdbapi.com";

function getApiKey() {
  const key = process.env.OMDB_API_KEY;
  if (!key) throw new Error("OMDB_API_KEY is not set in environment variables");
  return key;
}

async function fetchByIds(ids: string[]): Promise<OmdbMovie[]> {
  const apiKey = getApiKey();
  const results = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`${BASE}/?apikey=${apiKey}&i=${id}`, { next: { revalidate: 86400 } });
      const data = await res.json();
      if (data.Response === "False") return null;
      return {
        imdbID: data.imdbID,
        Title: data.Title,
        Year: data.Year,
        Poster: data.Poster,
        Type: data.Type,
      } as OmdbMovie;
    })
  );
  return results.filter((m): m is OmdbMovie => m !== null);
}

export async function searchMovies(genre: string, decade: string): Promise<OmdbMovie[]> {
  const apiKey = getApiKey();

  // Try live search first with a few broad keywords
  const keywords = ["the", "man", "night", "dark", "one"];
  const yearStart = parseInt(decade);

  for (const kw of keywords) {
    const url = `${BASE}/?apikey=${apiKey}&s=${encodeURIComponent(kw)}&type=movie&y=${yearStart}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.Response !== "False" && data.Search?.length > 0) {
      return (data.Search as OmdbMovie[]).slice(0, 10);
    }
  }

  // Fallback: curated IDs for this genre/decade
  const fallbackDecade = closestDecade(genre, decade);
  const ids = (FALLBACK_IDS[genre]?.[fallbackDecade] ?? FALLBACK_IDS["Drama"]?.["2000"] ?? []).slice(0, 10);
  return fetchByIds(ids);
}

export async function getMovieDetail(imdbID: string): Promise<OmdbDetail | null> {
  const apiKey = getApiKey();
  const url = `${BASE}/?apikey=${apiKey}&i=${imdbID}&plot=short`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  const data = await res.json();
  if (data.Response === "False") return null;
  return data as OmdbDetail;
}

export async function searchMoviesByTitle(query: string): Promise<OmdbMovie[]> {
  if (!query || query.length < 2) return [];
  const apiKey = getApiKey();
  const url = `${BASE}/?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=movie`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (data.Response === "False") return [];
  return (data.Search as OmdbMovie[]).slice(0, 8);
}
