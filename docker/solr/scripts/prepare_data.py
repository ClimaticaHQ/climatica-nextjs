import csv
import json
import os
from collections import defaultdict

# * paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "../data")

ALL_COUNTRIES = os.path.join(DATA_DIR, "allCountries.txt")
ALTERNATE_NAMES = os.path.join(DATA_DIR, "alternateNamesV2.txt")
OUTPUT_CSV = os.path.join(DATA_DIR, "cities.csv")

# * all languages are stored to one json file for one source of truth across the app
LOCALES_JSON = os.path.join(BASE_DIR, "../../../src/configs/locales.json")

# * feature codes to include
ALLOWED_FEATURE_CODES = {
    "PPL",    # populated place
    "PPLA",   # seat of first-order admin division
    "PPLA2",  # seat of second-order admin division
    "PPLA3",  # seat of third-order admin division
    "PPLA4",  # seat of fourth-order admin division
    "PPLA5",  # seat of fifth-order admin division
    "PPLC",   # capital city
    #"PPLX",   # section of populated place
}


def load_lang_order(path=None):
    with open(path or LOCALES_JSON, encoding="utf-8") as f:
        langs = json.load(f)

    if not isinstance(langs, list) or not langs:
        raise ValueError(f"{path or LOCALES_JSON} must contain a non-empty JSON array of locale codes")

    return langs


# * languages to extract from alternateNamesV2; the CSV's label_<lang> columns follow
# * locales.json's order
LANG_ORDER = load_lang_order()
TARGET_LANGS = set(LANG_ORDER)


def should_update_name(current, is_preferred):
    """Decide whether a new alternate-name entry should replace the current label for a lang.

    The first entry for a lang is always taken; a later preferred entry upgrades a
    non-preferred current one; a later non-preferred entry never overwrites a preferred one.
    """
    if current["name"] is None:
        # * first entry for this lang — always take it
        return True
    if is_preferred and not current["preferred"]:
        # * new entry is preferred, current is not — upgrade
        return True
    return False


# * alternateNamesV2.txt columns: 0 alternateNameId, 1 geonameid, 2 isolanguage, 3 name,
# * 4 isPreferredName, 5 isShortName, 6 isColloquial, 7 isHistoric (then from, to)
ALT_COL_PREFERRED = 4
ALT_COL_COLLOQUIAL = 6
ALT_COL_HISTORIC = 7

# * joins a city's search names in the CSV's `names` column (Solr splits it on import)
NAMES_SEPARATOR = "|"


def flag(parts, i):
    """Whether boolean column i of an alternate-names row is set ("1")."""
    return len(parts) > i and parts[i] == "1"


def load_city_ids():
    """The geonameids of the places prepare_cities() keeps, so only their names are loaded."""
    print("Collecting city ids...")
    ids = set()
    with open(ALL_COUNTRIES, encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) > 7 and parts[7] in ALLOWED_FEATURE_CODES:
                ids.add(parts[0])
    print(f"Found {len(ids):,} cities")
    return ids


def load_alternate_names(city_ids):
    """Per city: its display label per language, and every name it can be searched by.

    A label is the first name in that language, upgraded by a later preferred one
    (should_update_name); colloquial and historic names never become labels. The search
    names are every name in a target language except colloquial ones: a historic name
    (Leningrad, Constantinople) still finds the city.
    """
    print("Loading alternate names...")

    labels = defaultdict(lambda: {
        lang: {"name": None, "preferred": False}
        for lang in TARGET_LANGS
    })
    search_names = defaultdict(set)

    with open(ALTERNATE_NAMES, encoding="utf-8") as f:
        for line in f:
            # * rstrip("\n"), not strip(): strip() would also drop empty trailing columns
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 4:
                continue

            geonameid = parts[1]
            lang = parts[2]
            name = parts[3]

            # * skip non-language entries (link, wkdt, abbr, etc.) and places that aren't cities
            if lang not in TARGET_LANGS or geonameid not in city_ids:
                continue
            if flag(parts, ALT_COL_COLLOQUIAL):
                continue

            search_names[geonameid].add(name)

            if flag(parts, ALT_COL_HISTORIC):
                continue

            is_preferred = flag(parts, ALT_COL_PREFERRED)
            current = labels[geonameid][lang]
            if should_update_name(current, is_preferred):
                labels[geonameid][lang] = {"name": name, "preferred": is_preferred}

    result = {
        geonameid: {lang: data["name"] for lang, data in langs.items()}
        for geonameid, langs in labels.items()
    }

    print(f"Loaded alternate names for {len(search_names):,} cities")
    return result, search_names


def build_search_names(alternate_names, default_name, ascii_name):
    """Every name a city is found by, deduplicated, as one `names` CSV value."""
    names = {default_name, ascii_name, *alternate_names}
    # * a name holding the separator would split into fragments on import
    kept = sorted(name for name in names if name and NAMES_SEPARATOR not in name)
    return NAMES_SEPARATOR.join(kept)

# ? extracted previous logic for building labels in different languages
def build_labels(alt, default_name, ascii_name):
    """Resolve the label_<lang> columns for one city, in LANG_ORDER."""
    # * for label_en prefer:
    # *   1. alternate name with lang=en
    # *   2. default_name
    # *   3. ascii_name (no diacritics, good for search)
    label_en = alt.get("en") or default_name or ascii_name

    labels = {"en": label_en}
    # * label_uk falls back to label_en (not ascii_name) rather than the
    # * Latin-transliterated ascii_name, which would be a poor UK label
    labels["uk"] = alt.get("uk") or default_name or label_en

    for lang in LANG_ORDER:
        if lang in ("en", "uk"):
            continue
        labels[lang] = alt.get(lang) or default_name or ascii_name

    return labels


def prepare_cities():
    city_ids = load_city_ids()
    alt_names, search_names = load_alternate_names(city_ids)

    print("Processing allCountries.txt...")

    count = 0
    skipped = 0

    with open(ALL_COUNTRIES, encoding="utf-8") as infile, \
         open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as outfile:

        writer = csv.writer(outfile)

        # * header
        writer.writerow(
            ["id", "geonameid"]
            + [f"label_{lang}" for lang in LANG_ORDER]
            + ["names", "latitude", "longitude", "feature_code", "country_code", "population"]
        )

        for line in infile:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 15:
                skipped += 1
                continue

            # * allCountries.txt columns:
            # 0  geonameid
            # 1  name (default name, often the local transliteration)
            # 2  asciiname (ASCII-safe version)
            # 4  latitude
            # 5  longitude
            # 7  feature_code
            # 8  country_code
            # 14 population

            geonameid    = parts[0]
            default_name = parts[1]
            ascii_name   = parts[2]
            latitude     = parts[4]
            longitude    = parts[5]
            feature_code = parts[7]
            country_code = parts[8]
            population   = parts[14] or "0"

            if feature_code not in ALLOWED_FEATURE_CODES:
                skipped += 1
                continue

            alt = alt_names.get(geonameid, {})
            labels = build_labels(alt, default_name, ascii_name)
            names = build_search_names(search_names.get(geonameid, ()), default_name, ascii_name)

            writer.writerow(
                [geonameid, geonameid]
                + [labels[lang] for lang in LANG_ORDER]
                + [names, latitude, longitude, feature_code, country_code, population]
            )

            count += 1
            if count % 100_000 == 0:
                print(f"  Processed {count:,} cities...")

    print(f"\nDone!")
    print(f"  Cities written: {count:,}")
    print(f"  Rows skipped:   {skipped:,}")
    print(f"  Output: {OUTPUT_CSV}")


if __name__ == "__main__":
    prepare_cities()