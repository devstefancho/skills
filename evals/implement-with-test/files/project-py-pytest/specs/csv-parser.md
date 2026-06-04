# CSV Parser Module

## Purpose
Create a CSV parsing module that reads CSV files and converts them into normalized dictionaries, supporting custom delimiters and header mapping.

## Requirements
- Parse CSV files into list of dictionaries with normalized keys
- Support custom delimiters (comma, tab, semicolon)
- Handle missing values by filling with None
- Skip empty rows automatically

## Approach
Implement a CsvParser class using Python's built-in csv module. The parser reads headers from the first row, normalizes them using the existing normalizer utility, and maps each subsequent row to a dictionary. Place the module in src/transformers/ alongside the normalizer.

## Verification
- Parsing a standard CSV returns correct list of dictionaries
- Custom delimiter (tab) is handled correctly
- Missing values in rows are filled with None
- Empty rows are skipped in output
- Header keys are normalized (lowercase, underscores)
