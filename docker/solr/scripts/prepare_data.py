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


# * languages to extract from alternateNamesV2
# * in the output CSV (label_<lang> columns follow abc order accordingly to locales.json). 
LANG_ORDER = load_lang_order()
TARGET_LANGS = set(LANG_ORDER)


def should_update_name(current, is_preferred):
    """Decide whether a new alternate-name entry should replace the current one for a lang.

    Priority: first entry for a lang is always taken; a later preferred=1 entry
    upgrades a non-preferred current entry; a later preferred=0 entry never
    overwrites an already-preferred current entry.
    """
    if current["name"] is None:
        # * first entry for this lang — always take it
        return True
    if is_preferred and not current["preferred"]:
        # * new entry is preferred, current is not — upgrade
        return True
    return False


def load_alternate_names():
    print("Loading alternate names...")

    # * structure: geonameid -> lang -> (name, alt_id, is_preferred)
    # * we pick the best name per lang using priority:
    # *   1. preferred=1 with highest alt_id (most recent preferred)
    # *   2. any name with highest alt_id (most recent non-preferred)
    # ! (CHANGE)
    # * we pick the best name per lang using priority:
    # *   1. earliest entry with preferred=1
    # *   2. earliest entry if no one has preferred=1
    names = defaultdict(lambda: {
        lang: {"name": None, "alt_id": 0, "preferred": False}
        for lang in TARGET_LANGS
    })

    with open(ALTERNATE_NAMES, encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) < 4:
                continue

            try:
                alt_id = int(parts[0])
            except ValueError:
                continue

            geonameid = parts[1]
            lang = parts[2]
            name = parts[3]

            # * skip non-language entries (link, wkdt, abbr, etc.)
            if lang not in TARGET_LANGS:
                continue

            # * is_preferred is column index 4 or 5 (value "1" means preferred)
            is_preferred = ((len(parts) > 4 and parts[4] == "1") or (len(parts) > 5 and parts[5] == "1"))

            current = names[geonameid][lang]

            if should_update_name(current, is_preferred):
                names[geonameid][lang] = {
                    "name": name,
                    "alt_id": alt_id,
                    "preferred": is_preferred,
                }

    # * flatten to simple geonameid -> lang -> name dict
    result = {}
    for geonameid, langs in names.items():
        result[geonameid] = {lang: data["name"] for lang, data in langs.items()}

    print(f"Loaded alternate names for {len(result)} places")
    return result

# ? extracted previous logic for building labels in different languages
def build_labels(alt, default_name, ascii_name):
    """Resolve the label_<lang> columns for one city, in LANG_ORDER."""
    # * for label_en prefer:
    # *   1. alternate name with lang=en (preferred/recent)
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
    alt_names = load_alternate_names()

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
            + ["latitude", "longitude", "feature_code", "country_code", "population"]
        )

        for line in infile:
            parts = line.strip().split("\t")
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

            writer.writerow(
                [geonameid, geonameid]
                + [labels[lang] for lang in LANG_ORDER]
                + [latitude, longitude, feature_code, country_code, population]
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