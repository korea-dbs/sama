# SAMA

SQLite Analyzer for Android Media Access

## Introduction

SAMA offers intuitive web-based dashboards and allows users to evaluate media access performance on different configurations, leveraging media access queries collected from Android applications

SAMA is a comprehensive Analyzing tool designed to analyze the performance of SQLite database systems with a focus on media access in Android environments. Developed by researchers from Korea University and Hankuk University of Foreign Studies and Samsung Electronics, this tool addresses the gap in understanding media access's impact on SQLite performance within Android systems. By leveraging media access queries collected from real Android applications, SAMA offers a nuanced analysis through interactive web-based dashboards, enabling users to evaluate media access performance under various configurations.

## Authors
- Dongkyun Chung (Korea University) - <cdk6042@korea.ac.kr>
- Dohwan Lee (Hankuk University of Foreign Studies) - <dohwan0123@hufs.ac.kr>
- Jisub Kim (Hankuk University of Foreign Studies) - <0226daniel@hufs.ac.kr>
- Hyeeun Jun (Samsung Electronics) - <hyeeun.jun@samsung.com>
- Kisung Lee (Samsung Electronics) - <kiras.lee@samsung.com>
- Woojoong Lee (Samsung Electronics) - <woojoong.lee@samsung.com>
- Jonghyeok Park (Korea University) - <jonghyeok_park@korea.ac.kr>

## Features

- **Comprehensive Analysis**: Evaluates SQLite's performance in handling media access within Android, highlighting the implications of media files on database operations.
- **Interactive Dashboards**: Utilizes intuitive web-based dashboards for configuring analyzer, executing queries, and analyzing results in real-time.
- **Real Application Queries**: Incorporates media access queries from representative Android applications, providing a realistic analyzing scenario.

## Dashboard

SAMA comprises two main components: a web-based dashboard and a benchmark backend. The dashboard facilitates configuration management, query execution, and interactive analysis. The backend handles API requests, executes commands on Android devices via adb, and collects performance metrics for analysis.


![sama](https://github.com/user-attachments/assets/4ea9c1ad-9f50-47b4-909d-c97c2c973f12)


## Getting Started

### Prerequisites for Host Machine

- Ubuntu `20.04.6 LTS`
- [nodejs](https://github.com/nvm-sh/nvm#installing-and-updating) `18.0.0`
- [docker](./docs/docker-install.md) `24.0.7`
- [adb](https://developer.android.com/tools/sdkmanager) `35.0.0-11411520`
- [fastboot](https://developer.android.com/tools/sdkmanager) `35.0.0-11411520`
- sqlite3 `3.45.2`

### Prerequisites for Android Device

- Android device with at least Android version 13
- Android Must be rooted to run the benchmark

### Installation

1. Clone the repository:

   ```sh
   git clone [https://github.com/korea-dbs/sama.git]
   cd sambench
   ```

2. Change Env Values:

   ```sh
   cp .env.example .env
   vim .env
   ```

2. Start Infra Services:

   ```sh
   docker compos up -d
   ```
   
3. Start Api Server:

   ```sh
   cd api
   npm install -g yarn
   yarn install
   pm2 start yarn --name sambench -- start:dev --preserveWatchOutput
   ```

### Setup

1. Setup Enviornments

Visit this link and execute apis below

http://localhost:3000/api

```
PUT /setup/storage/generate-batch
PUT /setup/storage/push-scripts
PUT /setup/storage/push-query
```

2. Setup Host Sqlite

To modify the Makefile, add the following to the CFLAGS:

```
CFLAGS =   -DVDBE_PROFILE -DSQLITE_DEBUG -DSQLITE_PERFORMANCE_TRACE
```

3. Login to Grafana

http://localhost:3001

4. Run Dashboard

http://localhost:3002


### Usage

- **Configuration Management**: Set up your benchmark configurations using the dashboard, specifying parameters such as media file types and system load.
- **Query Execution**: Execute media access queries on your Android device, modifying conditions and configurations as needed.
- **Interactive Analysis**: Analyze the benchmark results through the dashboard, comparing various performance metrics across different configurations.

## Demonstration

SAMA was demonstrated using a Google Pixel 7, showcasing its ability to construct realistic experimental environments and evaluate SQLite's performance under diverse conditions such as media file types and storage fragmentation.







# OVFL-SQLite

ovfl-sqlite is an optimized version designed to handle overflow pages efficiently.
In this version, a specialized controller is implemented to manage overflow pages, aiming to improve performance for databases that contain a large number of such pages.

## Features

- **Large Payload Controller**:
  The Large Payload Controller enables the separation of regular pages and overflow pages, allowing them to be stored in different storage devices.
- **Wal Frame header**:
  The WAL frame header stores both the large payload page number and the regular database page number, and provides the correct mapping between them when the data is needed.

## Getting Started

### Build
1. Install the OVFL-SQLite
```
[git clone https://github.com/korea-dbs/sama.git]
```

2. Configure
```
cd ovfl-sqlite
mkdir bld && cd bld
../src/configure
```

3. Compile
```
make -j
sudo make install -j
```

## Run
4. Make Overflow DB
   Generate a dump.sql file from the original (vanilla) database that you want to separate into an overflow database.
```
vanilla_sqlite3[this sqlite engine is vanilla_sqlite] dump > dump.sql
```

5. Prepare new db
```
vanilla_sqlite3 [new DB file(.db)]
PRAGMA journal_mode = WAL;
.quit
```


6. Read dump
```
cd [path to ovfl_sqlite bld dir]
./sqlite3 [new DB file(.db)]
.read dump.sql[Path to dump.sql]
```
The new.db now contains the same data as the vanilla database, but its structure has been modified to store overflow pages separately. 
To run regular queries, simply launch SQLite using ovfl_sqlite with the new.db file, and execute queries in the same way as before.





# SCRIPTS 

### Prerequisites
- **Python** (Python 3.8.10 [Python Download Link](https://www.python.org/downloads/release/python-3810/))

## 1.SQLite Analyzer.py
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

## 2.vdbe_parser.py
### Features
A tool that parses operations from a `vdbe_profile.out` file and exports them into a `.csv` file.

This tool reads a vdbe_profile.out file, which contains profiling information from the SQLite Virtual Database Engine (VDBE), and extracts detailed operation records. It then converts and outputs the parsed data into a structured CSV format, making it easier to analyze and visualize VDBE execution performance.
### Usage
```
python3 vdbe_parser.py vdbe_profile.out
```

## 3.iolog.py
### Features
A tool that calculate IO operation from a `ftrace` file 

This script measures the I/O operation latency and disk seek distance from an ftrace log collected during query execution on an Android device.
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
A tool that calculate IO read bandwidth from a `ftrace` file 

This script measures the I/O read operation bandwidth from an ftrace log collected during query execution on an Android device.
### Usage
```
python3 readbandwidth.py test.txt[ftrace log file]
```
## 5.adbovfl.sh | adbquery.sh
### Features
 
This script generates an ftrace log while running a target query on an Android device and summarizes the execution time of the query.
### Usage in Android device
```
sh adbquery.sh [DB Path] [ target query Path] [ftrace file name]
sh adbovfl.sh [overflow DB Path] [ target query Path] [ftrace file name]
```








## License

This work is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

## Acknowledgments

- This project is a collaborative effort between Hankuk University of Foreign Studies, Korea University and Samsung Electronics.
- Special thanks to all contributors and the open-source community for making this project possible.

## Contact

For any inquiries, please reach out to the authors through their provided email addresses.






