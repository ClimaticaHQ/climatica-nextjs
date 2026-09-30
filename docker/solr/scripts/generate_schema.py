"""Generates docker/solr/schema.json from src/configs/locales.json.

schema.json is posted to Solr as-is (see the "solr:schema" npm script), so it
can't read locales.json at request time -- it has to be regenerated whenever
the locale list changes. Run this script after editing locales.json:

    python3 docker/solr/scripts/generate_schema.py

Every locale gets identical treatment: a label_<lang> field (suggestType) and
a label_<lang>_ngram field (trigramType), plus a copy-field wiring the first
into the second -- the same pattern prepare_data.py's LANG_ORDER already
mirrors for the CSV columns
"""
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCALES_JSON = os.path.join(BASE_DIR, "../../../src/configs/locales.json")
SCHEMA_JSON = os.path.join(BASE_DIR, "../schema.json")


def load_locales():
    with open(LOCALES_JSON, encoding="utf-8") as f:
        locales = json.load(f)

    if not isinstance(locales, list) or not locales:
        raise ValueError(f"{LOCALES_JSON} must contain a non-empty JSON array of locale codes")

    return locales


def build_schema(locales):
    add_field_type = [
        {
            "name": "suggestType",
            "class": "solr.TextField",
            "positionIncrementGap": "100",
            "indexAnalyzer": {
                "tokenizer": {"class": "solr.StandardTokenizerFactory"},
                "filters": [
                    {"class": "solr.LowerCaseFilterFactory"},
                    {"class": "solr.ASCIIFoldingFilterFactory"},
                ],
            },
            "queryAnalyzer": {
                "tokenizer": {"class": "solr.StandardTokenizerFactory"},
                "filters": [
                    {"class": "solr.LowerCaseFilterFactory"},
                    {"class": "solr.ASCIIFoldingFilterFactory"},
                ],
            },
        },
        {
            "name": "trigramType",
            "class": "solr.TextField",
            "positionIncrementGap": "100",
            "indexAnalyzer": {
                "tokenizer": {"class": "solr.StandardTokenizerFactory"},
                "filters": [
                    {"class": "solr.LowerCaseFilterFactory"},
                    {"class": "solr.ASCIIFoldingFilterFactory"},
                    {
                        "class": "solr.NGramFilterFactory",
                        "minGramSize": "3",
                        "maxGramSize": "10",
                    },
                ],
            },
            "queryAnalyzer": {
                "tokenizer": {"class": "solr.StandardTokenizerFactory"},
                "filters": [
                    {"class": "solr.LowerCaseFilterFactory"},
                    {"class": "solr.ASCIIFoldingFilterFactory"},
                ],
            },
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
                "type": "suggestType",
                "multiValued": False,
                "indexed": True,
                "stored": True,
            }
        )

    for lang in locales:
        add_field.append(
            {
                "name": f"label_{lang}_ngram",
                "type": "trigramType",
                "multiValued": False,
                "indexed": True,
                "stored": False,
            }
        )

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

    add_copy_field = [
        {"source": f"label_{lang}", "dest": f"label_{lang}_ngram"} for lang in locales
    ]

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
