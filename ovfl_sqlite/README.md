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
vanilla_sqlite3[!!this sqlite engine is vanilla_sqlite!!] dump > dump.sql
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


## Contact

Jonghyeok Park jonghyeok_park@korea.ac.kr  
Dohwan Lee dohwan0123@hufs.ac.kr
Dongkyun Chung cdk6042@korea.ac.kr

