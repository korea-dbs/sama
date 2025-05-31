# SCRIPTS 

### Prerequisites
- **Python** (Python 3.8.10 [Python Download Link](https://www.python.org/downloads/release/python-3810/))

## 1.SQLite Analyzer.py
### Features
This tool provides information about the pages in a database file.

Here are the types of displayed page:

- Table Interior Page
Internal nodes in the B-tree structure of a table.

- Table Leaf Page
Leaf nodes in the table's B-tree structure.

- Index Interior Page
Internal nodes in an index B-tree.

- Index Leaf Page
Leaf nodes of the index B-tree.

- Overflow Page
This page is used when a row or index entry is too large to fit in a single page.

- Freelist Trunk Page
This page is a part of the freelist, which tracks unused pages.

- Freelist Leaf Page
This page contains references to free (unused) pages in the database.

- Freelist Map Page
This page provides a compact overview of available pages in the freelist.
### Usage
```
python3 SQLiteAnalyzer.py example.db
```

## 2.vdbe_parser.py
### Features
Parses operations from a `vdbe_profile.out` file and exports them into a `.csv` file.

This tool reads a vdbe_profile.out file, which contains profiling information from the SQLite Virtual Database Engine (VDBE), and extracts detailed operation records. 
The extracted data will be converted to a structured CSV format for easier analysis and visualization of VDBE execution performance.
### Usage
```
python3 vdbe_parser.py vdbe_profile.out
```

## 3.iolog.py
### Features
Calculates IO operation from a `ftrace` file 

This script measures I/O operation latency and disk seek distance with generated ftrace log. The log is generated during Android device's query execution.
### Usage
```
python3 iolog.py test.txt[ftrace log file]
```
### Result Example
```
== Tail Latency Statistics ==
P95 Latency: 2.550 ms
P99 Latency: 3.118 ms
Max Latency: 3.282 ms
Average Latency: 0.87 ms

== Tail Distance Statistics ==
P95 Distance: 234130605
P99 Distance: 266048691
Max Distance: 286662496
Average Distance: 20698626
```
## 4.readbandwidth.py
### Features
Calculates IO read bandwidth from a `ftrace` file 

This script measures the I/O read operation bandwidth from an ftrace log. The log is generated from Android device's query execution.
### Usage
```
python3 readbandwidth.py test.txt[ftrace log file]
```
## 5.adbovfl.sh | adbquery.sh
### Features
 
This script generates an ftrace log while running a target query on an Android device and summarizes the query execution time data.

### Usage in Android device
```
sh adbquery.sh [DB Path] [ target query Path] [ftrace file name]
sh adbovfl.sh [overflow DB Path] [ target query Path] [ftrace file name]
```
