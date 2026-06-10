from src.transformers.normalizer import normalize_string, normalize_dict_keys


class TestNormalizeString:
    def test_strips_whitespace(self):
        assert normalize_string("  hello  ") == "hello"

    def test_converts_to_lowercase(self):
        assert normalize_string("Hello World") == "hello world"


class TestNormalizeDictKeys:
    def test_normalizes_keys(self):
        result = normalize_dict_keys({"First Name": "John", "Last Name": "Doe"})
        assert result == {"first_name": "John", "last_name": "Doe"}

    def test_empty_dict(self):
        assert normalize_dict_keys({}) == {}
