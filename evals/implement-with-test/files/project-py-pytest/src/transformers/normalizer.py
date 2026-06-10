from typing import Any


def normalize_string(value: str) -> str:
    """Strip whitespace and convert to lowercase."""
    return value.strip().lower()


def normalize_dict_keys(data: dict[str, Any]) -> dict[str, Any]:
    """Normalize all dictionary keys to lowercase with underscores."""
    return {k.strip().lower().replace(" ", "_"): v for k, v in data.items()}
