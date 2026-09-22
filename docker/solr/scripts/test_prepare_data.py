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
        current = {"name": None, "alt_id": 0, "preferred": False}
        assert prepare_data.should_update_name(current, is_preferred=False) is True
        assert prepare_data.should_update_name(current, is_preferred=True) is True

    def test_preferred_upgrades_non_preferred_current(self):
        current = {"name": "Existing", "alt_id": 1, "preferred": False}
        assert prepare_data.should_update_name(current, is_preferred=True) is True

    def test_non_preferred_does_not_overwrite_preferred_current(self):
        current = {"name": "Existing", "alt_id": 1, "preferred": True}
        assert prepare_data.should_update_name(current, is_preferred=False) is False

    def test_non_preferred_does_not_overwrite_non_preferred_current(self):
        current = {"name": "Existing", "alt_id": 1, "preferred": False}
        assert prepare_data.should_update_name(current, is_preferred=False) is False

    def test_preferred_does_not_overwrite_already_preferred_current(self):
        current = {"name": "Existing", "alt_id": 1, "preferred": True}
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
