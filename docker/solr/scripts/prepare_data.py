import csv
import os
from collections import defaultdict

# * paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "../data")

ALL_COUNTRIES = os.path.join(DATA_DIR, "allCountries.txt")
ALTERNATE_NAMES = os.path.join(DATA_DIR, "alternateNamesV2.txt")
OUTPUT_CSV = os.path.join(DATA_DIR, "cities.csv")

# * feature codes to include
ALLOWED_FEATURE_CODES = {
    "PPL",    # populated place
    "PPLA",   # seat of first-order admin division
    "PPLA2",  # seat of second-order admin division
    "PPLA3",  # seat of third-order admin division
    "PPLA4",  # seat of fourth-order admin division
    "PPLA5",  # seat of fifth-order admin division
    "PPLC",   # capital city
    "PPLX",   # section of populated place
}

# * languages to extract from alternateNamesV2
TARGET_LANGS = {"en", "uk", "es"}

def load_alternate_names():
    print("Loading alternate names...")
    
    # * alternateNameId, geonameid, isolanguage, alternateName, ...
    names = defaultdict(lambda: {"en": None, "uk": None, "es": None})
    
    with open(ALTERNATE_NAMES, encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) < 4:
                continue
            
            geonameid = parts[1]
            lang = parts[2]
            name = parts[3]
            
            if lang in TARGET_LANGS:
                if names[geonameid][lang] is None:
                    names[geonameid][lang] = name
    
    print(f"Loaded alternate names for {len(names)} places")
    return names

def prepare_cities():
    alt_names = load_alternate_names()
    
    print("Processing allCountries.txt...")
    
    count = 0
    skipped = 0

    with open(ALL_COUNTRIES, encoding="utf-8") as infile, \
         open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as outfile:

        writer = csv.writer(outfile)
        
        # * header
        writer.writerow([
            "id",           # geonameid (Solr uses "id" as unique key)
            "geonameid",
            "label_en",
            "label_uk",
            "label_es",
            "latitude",
            "longitude",
            "feature_code",
            "country_code",
            "population",
        ])

        for line in infile:
            parts = line.strip().split("\t")
            if len(parts) < 15:
                skipped += 1
                continue

            # * allCountries.txt columns:
            # 0  geonameid
            # 1  name (default, usually english)
            # 2  asciiname
            # 3  alternatenames (comma separated)
            # 4  latitude
            # 5  longitude
            # 6  feature class
            # 7  feature code
            # 8  country code
            # 14 population

            geonameid    = parts[0]
            default_name = parts[1]
            latitude     = parts[4]
            longitude    = parts[5]
            feature_code = parts[7]
            country_code = parts[8]
            population   = parts[14] or "0"

            if feature_code not in ALLOWED_FEATURE_CODES:
                skipped += 1
                continue

            alt = alt_names.get(geonameid, {})
            label_en = alt.get("en") or default_name
            label_uk = alt.get("uk") or label_en
            label_es = alt.get("es") or label_en

            writer.writerow([
                geonameid,
                geonameid,
                label_en,
                label_uk,
                label_es,
                latitude,
                longitude,
                feature_code,
                country_code,
                population,
            ])

            count += 1
            if count % 100_000 == 0:
                print(f"  Processed {count:,} cities...")

    print(f"\nDone!")
    print(f"  Cities written: {count:,}")
    print(f"  Rows skipped:   {skipped:,}")
    print(f"  Output: {OUTPUT_CSV}")

if __name__ == "__main__":
    prepare_cities()