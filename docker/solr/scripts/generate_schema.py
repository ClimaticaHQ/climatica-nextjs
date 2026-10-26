"""Generates docker/solr/schema.json from src/configs/locales.json.

schema.json is posted to Solr as-is (see the "solr:schema" npm script), so it
can't read locales.json at request time -- it has to be regenerated whenever
the locale list changes. Run this script after editing locales.json:

    python3 docker/solr/scripts/generate_schema.py

Every locale gets a label_<lang> field (nameText): the city's display name in
that language, the same columns prepare_data.py's LANG_ORDER writes. Search runs
mainly on `names`, every name of the city in every locale (multi-valued, not
stored), and on its edge n-grams in `names_prefix` for typing a name's start.

Both field types need ICU (ICUFoldingFilter), loaded from Solr's analysis-extras
contrib by the <lib> entries in solrconfig.xml.
"""
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCALES_JSON = os.path.join(BASE_DIR, "../../../src/configs/locales.json")
SCHEMA_JSON = os.path.join(BASE_DIR, "../schema.json")

# * ' ’ ʼ ` ´ — the apostrophes place names are written with
APOSTROPHES = "['’ʼ`´]"
PREFIX_MIN_GRAM = "2"
PREFIX_MAX_GRAM = "25"


def load_locales():
    with open(LOCALES_JSON, encoding="utf-8") as f:
        locales = json.load(f)

    if not isinstance(locales, list) or not locales:
        raise ValueError(f"{LOCALES_JSON} must contain a non-empty JSON array of locale codes")

    return locales


def build_schema(locales):
    # * apostrophe variants are removed before tokenising, so "Kam'yanets", "Kam’yanets" and
    # * "Kamyanets" index alike; ICU folding lowercases and strips diacritics in every script
    name_chain = [
        {"class": "solr.PatternReplaceCharFilterFactory", "pattern": APOSTROPHES, "replacement": ""},
    ]
    name_filters = [{"class": "solr.ICUFoldingFilterFactory"}]
    tokenizer = {"class": "solr.StandardTokenizerFactory"}

    def analyzer(filters):
        return {"charFilters": name_chain, "tokenizer": tokenizer, "filters": filters}

    add_field_type = [
        {
            "name": "nameText",
            "class": "solr.TextField",
            "positionIncrementGap": "100",
            "indexAnalyzer": analyzer(name_filters),
            "queryAnalyzer": analyzer(name_filters),
        },
        {
            # * a word's beginnings at index time only, so "kyi" finds "Kyiv" while the query
            # * itself stays whole
            "name": "namePrefix",
            "class": "solr.TextField",
            "positionIncrementGap": "100",
            "indexAnalyzer": analyzer(
                name_filters
                + [
                    {
                        "class": "solr.EdgeNGramFilterFactory",
                        "minGramSize": PREFIX_MIN_GRAM,
                        "maxGramSize": PREFIX_MAX_GRAM,
                    }
                ]
            ),
            "queryAnalyzer": analyzer(name_filters),
        },
    ]

    add_field = [
        {
            "name": "geonameid",
            "type": "pint",
            "multiValued": False,
            "indexed": True,
            "stored": True,
        }
    ]

    for lang in locales:
        add_field.append(
            {
                "name": f"label_{lang}",
                "type": "nameText",
                "multiValued": False,
                "indexed": True,
                "stored": True,
            }
        )

    add_field += [
        {
            "name": "names",
            "type": "nameText",
            "multiValued": True,
            "indexed": True,
            "stored": False,
        },
        {
            "name": "names_prefix",
            "type": "namePrefix",
            "multiValued": True,
            "indexed": True,
            "stored": False,
        },
    ]

    add_field += [
        {
            "name": "latitude",
            "type": "pdouble",
            "multiValued": False,
            "indexed": True,
            "stored": True,
        },
        {
            "name": "longitude",
            "type": "pdouble",
            "multiValued": False,
            "indexed": True,
            "stored": True,
        },
        {
            "name": "feature_code",
            "type": "string",
            "multiValued": False,
            "indexed": True,
            "stored": True,
        },
        {
            "name": "country_code",
            "type": "string",
            "multiValued": False,
            "indexed": True,
            "stored": True,
        },
        {
            "name": "population",
            "type": "plong",
            "multiValued": False,
            "indexed": True,
            "stored": True,
        },
    ]

    add_copy_field = [{"source": "names", "dest": "names_prefix"}]

    return {
        "add-field-type": add_field_type,
        "add-field": add_field,
        "add-copy-field": add_copy_field,
    }


def main():
    locales = load_locales()
    schema = build_schema(locales)

    with open(SCHEMA_JSON, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)
        f.write("\n")

    print(f"Wrote {SCHEMA_JSON} for locales: {', '.join(locales)}")


if __name__ == "__main__":
    main()
