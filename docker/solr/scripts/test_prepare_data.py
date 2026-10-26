import json

import pytest

import prepare_data


class TestBuildLabels:
    def test_en_prefers_alt(self):
        alt = {"en": "AltEnName"}
        labels = prepare_data.build_labels(alt, "DefaultName", "AsciiName")
        assert labels["en"] == "AltEnName"

    def test_en_falls_back_to_default_name(self):
        labels = prepare_data.build_labels({}, "DefaultName", "AsciiName")
        assert labels["en"] == "DefaultName"

    def test_en_falls_back_to_ascii_name(self):
        labels = prepare_data.build_labels({}, "", "AsciiName")
        assert labels["en"] == "AsciiName"

    def test_uk_prefers_alt_uk(self):
        alt = {"en": "AltEnName", "uk": "AltUkName"}
        labels = prepare_data.build_labels(alt, "DefaultName", "AsciiName")
        assert labels["uk"] == "AltUkName"

    def test_uk_falls_back_to_default_name_before_label_en(self):
        # alt has no "uk" entry; default_name is truthy so it should win over label_en
        alt = {"en": "AltEnName"}
        labels = prepare_data.build_labels(alt, "DefaultName", "AsciiName")
        assert labels["uk"] == "DefaultName"

    def test_uk_falls_back_to_label_en_not_ascii_name(self):
        # alt has no "uk" entry and default_name is falsy, so uk must fall back
        # to label_en specifically -- not to ascii_name.
        alt = {"en": "AltEnName"}
        labels = prepare_data.build_labels(alt, "", "AsciiName")
        assert labels["uk"] == "AltEnName"
        assert labels["uk"] != "AsciiName"

    def test_es_prefers_alt(self):
        assert "es" in prepare_data.LANG_ORDER
        alt = {"es": "AltEsName"}
        labels = prepare_data.build_labels(alt, "DefaultName", "AsciiName")
        assert labels["es"] == "AltEsName"

    def test_es_falls_back_to_default_name(self):
        labels = prepare_data.build_labels({}, "DefaultName", "AsciiName")
        assert labels["es"] == "DefaultName"

    def test_es_falls_back_to_ascii_name(self):
        labels = prepare_data.build_labels({}, "", "AsciiName")
        assert labels["es"] == "AsciiName"

    def test_de_prefers_alt(self):
        assert "de" in prepare_data.LANG_ORDER
        alt = {"de": "AltDeName"}
        labels = prepare_data.build_labels(alt, "DefaultName", "AsciiName")
        assert labels["de"] == "AltDeName"

    def test_de_falls_back_to_default_name(self):
        labels = prepare_data.build_labels({}, "DefaultName", "AsciiName")
        assert labels["de"] == "DefaultName"

    def test_de_falls_back_to_ascii_name(self):
        labels = prepare_data.build_labels({}, "", "AsciiName")
        assert labels["de"] == "AsciiName"

    def test_empty_alt_dict_falls_back_for_every_lang(self):
        labels = prepare_data.build_labels({}, "DefaultName", "AsciiName")
        assert labels["en"] == "DefaultName"
        assert labels["uk"] == "DefaultName"
        for lang in prepare_data.LANG_ORDER:
            assert labels[lang] == "DefaultName"


class TestShouldUpdateName:
    def test_first_entry_always_updates(self):
        current = {"name": None, "preferred": False}
        assert prepare_data.should_update_name(current, is_preferred=False) is True
        assert prepare_data.should_update_name(current, is_preferred=True) is True

    def test_preferred_upgrades_non_preferred_current(self):
        current = {"name": "Existing", "preferred": False}
        assert prepare_data.should_update_name(current, is_preferred=True) is True

    def test_non_preferred_does_not_overwrite_preferred_current(self):
        current = {"name": "Existing", "preferred": True}
        assert prepare_data.should_update_name(current, is_preferred=False) is False

    def test_non_preferred_does_not_overwrite_non_preferred_current(self):
        current = {"name": "Existing", "preferred": False}
        assert prepare_data.should_update_name(current, is_preferred=False) is False

    def test_preferred_does_not_overwrite_already_preferred_current(self):
        current = {"name": "Existing", "preferred": True}
        assert prepare_data.should_update_name(current, is_preferred=True) is False


class TestLoadLangOrder:
    def test_valid_json_array(self, tmp_path):
        path = tmp_path / "locales.json"
        path.write_text(json.dumps(["en", "uk", "es"]), encoding="utf-8")
        assert prepare_data.load_lang_order(str(path)) == ["en", "uk", "es"]

    def test_empty_array_raises_value_error(self, tmp_path):
        path = tmp_path / "locales.json"
        path.write_text("[]", encoding="utf-8")
        with pytest.raises(ValueError):
            prepare_data.load_lang_order(str(path))

    def test_non_list_json_raises_value_error(self, tmp_path):
        path = tmp_path / "locales.json"
        path.write_text(json.dumps({"en": True}), encoding="utf-8")
        with pytest.raises(ValueError):
            prepare_data.load_lang_order(str(path))

    def test_invalid_json_raises_value_error(self, tmp_path):
        path = tmp_path / "locales.json"
        path.write_text("{not valid json", encoding="utf-8")
        with pytest.raises(ValueError):
            prepare_data.load_lang_order(str(path))


def alt_row(geonameid, lang, name, preferred="", short="", colloquial="", historic=""):
    return "\t".join(["1", geonameid, lang, name, preferred, short, colloquial, historic, "", ""])


class TestFlag:
    def test_set_column(self):
        assert prepare_data.flag(["a", "b", "1"], 2) is True

    def test_empty_or_missing_column(self):
        assert prepare_data.flag(["a", "b", ""], 2) is False
        assert prepare_data.flag(["a"], 2) is False


class TestLoadAlternateNames:
    def load(self, tmp_path, monkeypatch, rows, city_ids=("1",)):
        path = tmp_path / "alternateNamesV2.txt"
        path.write_text("".join(row + "\n" for row in rows), encoding="utf-8")
        monkeypatch.setattr(prepare_data, "ALTERNATE_NAMES", str(path))
        return prepare_data.load_alternate_names(set(city_ids))

    def test_short_name_column_is_not_preferred(self, tmp_path, monkeypatch):
        labels, _ = self.load(tmp_path, monkeypatch, [
            alt_row("1", "en", "First"),
            alt_row("1", "en", "Short", short="1"),
        ])
        assert labels["1"]["en"] == "First"

    def test_preferred_upgrades_label(self, tmp_path, monkeypatch):
        labels, _ = self.load(tmp_path, monkeypatch, [
            alt_row("1", "en", "First"),
            alt_row("1", "en", "Preferred", preferred="1"),
        ])
        assert labels["1"]["en"] == "Preferred"

    def test_colloquial_and_historic_never_label(self, tmp_path, monkeypatch):
        labels, _ = self.load(tmp_path, monkeypatch, [
            alt_row("1", "en", "Peter", preferred="1", colloquial="1"),
            alt_row("1", "en", "Leningrad", preferred="1", historic="1"),
            alt_row("1", "en", "Saint Petersburg"),
        ])
        assert labels["1"]["en"] == "Saint Petersburg"

    def test_search_names_keep_historic_drop_colloquial(self, tmp_path, monkeypatch):
        _, names = self.load(tmp_path, monkeypatch, [
            alt_row("1", "en", "Saint Petersburg"),
            alt_row("1", "en", "Leningrad", historic="1"),
            alt_row("1", "en", "Peter", colloquial="1"),
        ])
        assert names["1"] == {"Saint Petersburg", "Leningrad"}

    def test_only_target_languages_and_kept_cities(self, tmp_path, monkeypatch):
        labels, names = self.load(tmp_path, monkeypatch, [
            alt_row("1", "link", "https://example.org"),
            alt_row("2", "en", "Not a city"),
        ])
        assert "2" not in names and "2" not in labels
        assert "1" not in names


class TestBuildSearchNames:
    def test_deduplicates_and_includes_default_and_ascii(self):
        value = prepare_data.build_search_names({"Kyiv", "Kiev", "Kyiv"}, "Kyiv", "Kyiv")
        assert value.split(prepare_data.NAMES_SEPARATOR) == ["Kiev", "Kyiv"]

    def test_skips_names_with_the_separator(self):
        value = prepare_data.build_search_names({"A|B"}, "Default", "Ascii")
        assert value.split(prepare_data.NAMES_SEPARATOR) == ["Ascii", "Default"]
