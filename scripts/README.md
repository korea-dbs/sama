# SCRIPTS 

### Prerequisites
- **Python** (Python 3.8.10 [Python Download Link](https://www.python.org/downloads/release/python-3810/))
- 
## SQLite Analyzer.py
### Features
This tool provides information about the pages in a database file.
The list of page types displayed by the tool includes:

- Table Interior Page
These are internal nodes in the B-tree structure of a table.

- Table Leaf Page
These are leaf nodes in the table's B-tree structure.

- Index Interior Page
These are internal nodes in an index B-tree.

- Index Leaf Page
These are the leaf nodes of the index B-tree.

- Overflow Page
Used when a row or index entry is too large to fit in a single page.

- Freelist Trunk Page
These pages are part of the freelist, which tracks unused pages.

- Freelist Leaf Page
These contain references to free (unused) pages in the database.

- Freelist Map Page
It provides a compact overview of available pages in the freelist.
### Usage
```
python3 SQLiteAnalyzer.py example.db
```

## vdbe_parser.py
### Features
A tool that parses operations from a `vdbe_profile.out` file and exports them into a `.csv` file.

This tool reads a vdbe_profile.out file, which contains profiling information from the SQLite Virtual Database Engine (VDBE), and extracts detailed operation records. It then converts and outputs the parsed data into a structured CSV format, making it easier to analyze and visualize VDBE execution performance.
### Usage
```
python3 vdbe_parser.py vdbe_profile.out
```
