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
   vanilla_sqlite3[!!this is vanilla_sqlite!!] dump > dump.sql
   ```
```
./sqlite3 [PATH TO DB file]
```


## Contact

Jonghyeok Park jonghyeok_park@korea.ac.kr  
Yewon Shin syw22@hufs.ac.kr


