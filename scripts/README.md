# SCRIPTS 
## SQLite Analyzer.py
### Explain
This tool provides information about the pages in a database file.
The list of page types displayed by the tool includes:

Table Interior Page
These are internal nodes in the B-tree structure of a table.
They contain references to child pages but do not store actual row data.

Table Leaf Page
These are leaf nodes in the table's B-tree structure.
They store the actual row data of the table.

Index Interior Page
These are internal nodes in an index B-tree.
They store keys and pointers to child pages, helping guide the search path.

Index Leaf Page
These are the leaf nodes of the index B-tree.
They contain index keys and references to the corresponding rows in the table.

Overflow Page
Used when a row or index entry is too large to fit in a single page.
Additional data is stored in one or more overflow pages.

Freelist Trunk Page
These pages are part of the freelist, which tracks unused pages.
Trunk pages point to freelist leaf pages.

Freelist Leaf Page
These contain references to free (unused) pages in the database.
They are linked from the trunk page.

Freelist Map Page
This page manages a bitmap or mapping of free pages.
It provides a compact overview of available pages in the freelist.
### Usage
```
python3 SQLiteAnalyzer.py example.db
```
