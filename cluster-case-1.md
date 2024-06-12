### A self declaration system 

#### Objective 
In city M, inhabitants are required to make self declaration of blah blah blah in every XX hours a day. Applicants first visit a web page, fill in basic information, confirm on certain terms and press submit button. Upon a successful submission, a pass code is granted. 

![alt self declaration](/cluster-docker/img/health_declaration.png)

Basic information includes: 
- name 
- birthday 
- gender
- social security number 
- address 
- mobile phone
- etc

Terms to confirm are subjected to change without notice. 


#### preliminary analysis 
All governmental departments, private sectors, local facilities, banks, schools, stations etc are responsible for the checking of validity of pass code. Any illegal trespassing or reluctant to fulfill the new regulations will be charged and detained for XX days. 

Local population is around 600,000, application peak hour is in 7:30AM to 8:30AM every morning. A database is required to sustain 10.000 read/write operation per second. Every inhabitant is expected to spend a couple of minutes to finish with the declaration. 


#### System design 
It's well known that most of the Redis operationss are sub-millisecond level. Let's supposes every read/write operation spends 1 ms. That means a single Redis server can serve 1000 read/write operations per second. 10,000 read/write per second means at least 10 servers is needed. Minus non-working people and infants, depending on available resources, 5 to 9 shards will suffice and survive our scenario. 7 shards is our reasonable estimation, each shard includes one primary node and two replica nodes. And thus a total of 21 nodes are used. 

If every read/write operation in SQL server takes 50ms, a 500 nodes cluster is needed. Cut it to half, a cluster of 250 nodes... 

As the title implies, 600,000 reads and writes at least once a day. Obviously, caching the *data block*, *access plan* or *query result* has no use. It just doesn't help to cache the data of person A to facilitate the situation of person B. 

> Long story short, REDIS allows you to store key-value pairs on your RAM. Since accessing RAM is 150,000 times faster than accessing a disk, and 500 times faster than accessing SSD, it means speed.

[What is Redis?](https://adevait.com/redis/what-is-redis)


#### EOF (2024/06/14)


ACID is an acronym that stands for Atomicity, Consistency, Isolation, and Durability. It represents a set of properties or characteristics that ensure reliability and integrity in database transactions. These properties are essential for maintaining data integrity and ensuring that database operations are performed reliably and consistently. Let's delve into each component of the ACID properties:

1. Atomicity: Atomicity refers to the indivisibility or "all-or-nothing" property of a transaction. It ensures that a transaction is treated as a single, indivisible unit of work. Either all the operations within the transaction are executed successfully, or none of them are. If any part of the transaction fails, all changes made within the transaction are rolled back, and the database returns to its previous state, ensuring data consistency.

2. Consistency: Consistency ensures that a transaction takes the database from one valid state to another valid state. It enforces integrity constraints, domain rules, and predefined relationships during the transaction. In other words, any transaction performed on the database must maintain the overall correctness and validity of the data. If a transaction violates any consistency rules, the changes are rolled back to maintain data integrity.

3. Isolation: Isolation guarantees that concurrent transactions do not interfere with each other. Each transaction operates independently, as if it were the only transaction being executed. Isolation prevents conflicts, such as dirty reads (reading uncommitted data), non-repeatable reads (reading different values in multiple reads of the same data), and phantom reads (seeing different sets of rows in subsequent reads due to concurrent modifications). Isolation levels, such as Read Uncommitted, Read Committed, Repeatable Read, and Serializable, provide different degrees of isolation for concurrent transactions.

4. Durability: Durability ensures that once a transaction is committed, its changes are permanent and will survive any subsequent failures, such as power outages, crashes, or system errors. The committed data is stored in non-volatile storage (usually disk) and can be recovered even in the event of a system failure. Durability guarantees that the effects of committed transactions persist in the database, providing reliability and data integrity.

The ACID properties collectively ensure transactional consistency, reliability, and fault tolerance in database systems. They play a crucial role in maintaining data integrity, preventing data corruption, and providing a reliable foundation for applications that rely on consistent and accurate data. It's worth noting that achieving full ACID compliance can impact performance, so there is a trade-off between strict adherence to ACID properties and performance requirements in certain scenarios.




In MySQL 8, there are several built-in mechanisms for caching data and improving performance. Here are some of the key caching features available:

1. InnoDB Buffer Pool: InnoDB is the default storage engine in MySQL 8, and it uses a buffer pool to cache frequently accessed data and index pages in memory. The size of the InnoDB buffer pool can be configured using the `innodb_buffer_pool_size` parameter. By keeping frequently used data in memory, the InnoDB buffer pool reduces disk I/O and improves query performance.

2. Query Cache: The query cache in MySQL 8 allows the caching of the results of SELECT queries. When a query is executed, MySQL checks if the same query with the same parameters has been executed before and if the result is already cached. If so, the cached result is returned directly, avoiding the need to re-execute the query. The query cache can be enabled and configured using the `query_cache_type` and `query_cache_size` parameters.

3. Key Caches: MySQL uses key caches to cache index blocks for MyISAM tables. The key cache improves the performance of index lookups by keeping frequently accessed index blocks in memory. The key cache size can be configured using the `key_buffer_size` parameter. However, note that MyISAM is not the default storage engine in MySQL 8, and InnoDB is recommended for most use cases.

4. Adaptive Hash Index: InnoDB also provides an adaptive hash index (AHI), which dynamically caches frequently accessed index pages in a hash table. The AHI can improve the performance of certain types of queries by reducing disk I/O for index lookups.

It's worth noting that the effectiveness of caching mechanisms in MySQL 8 depends on various factors, such as the workload, the size of the data, and the available memory. It's important to carefully configure and monitor the caching settings to ensure optimal performance for your specific use case. Additionally, MySQL 8 provides various performance monitoring tools and status variables that can help analyze and tune the caching behavior to improve overall performance.

[8.10.3 The MySQL Query Cache](https://dev.mysql.com/doc/refman/5.7/en/query-cache.html)

[10.10.2.2 Multiple Key Caches](https://dev.mysql.com/doc/refman/8.4/en/multiple-key-caches.html)

[17.5.1 Buffer Pool](https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html)

[17.5.3 Adaptive Hash Index](https://dev.mysql.com/doc/refman/8.4/en/innodb-adaptive-hash.html)




Oracle Database, a popular commercial RDBMS, offers several built-in mechanisms to support caching and optimize performance. Here are some of the key features:

1. Buffer Cache: Oracle Database maintains a buffer cache in memory to hold frequently accessed data blocks from disk. The buffer cache reduces disk I/O by caching data in memory, allowing faster access to frequently accessed data. The cache is managed using a least recently used (LRU) algorithm, and Oracle automatically determines which data blocks to keep in the cache based on their frequency of access.

2. Shared Pool: The shared pool is a memory area in Oracle Database that stores shared SQL and PL/SQL areas, such as parsed SQL statements, execution plans, and PL/SQL procedures. By caching and reusing these shared areas, Oracle avoids the need for repetitive parsing and optimization, improving performance. The shared pool also includes a library cache that caches SQL and PL/SQL code, reducing the overhead of parsing and optimizing frequently executed queries.

3. Result Cache: Oracle Database provides a result cache feature that allows query results to be cached in memory. When a query is executed, Oracle first checks if the result is already in the cache. If so, it retrieves the result from the cache instead of executing the query again, improving query response time. The result cache can be used for both static and dynamic queries.

4. Flash Cache: Oracle Database supports the use of flash cache, which is a solid-state storage device (e.g., SSD) used as an extension to the buffer cache. The flash cache stores frequently accessed data blocks, reducing disk I/O and improving overall performance. It acts as a secondary cache layer between the buffer cache and disk storage.

5. Automatic Memory Management (AMM): Oracle Database's AMM feature dynamically manages the allocation of memory components, such as the buffer cache, shared pool, and other memory structures. It automatically adjusts the sizes of these memory components based on the workload and memory demands, optimizing memory usage and overall performance.

These built-in mechanisms in Oracle Database help optimize performance by caching frequently accessed data, reusing shared SQL and PL/SQL areas, and dynamically managing memory resources to meet the workload demands. Configuring and tuning these mechanisms appropriately based on the specific database workload and requirements can lead to significant performance improvements.




MySQL and MariaDB, both open-source RDBMS, offer several built-in mechanisms to support caching and optimize performance. Here are some of the key features:

1. Query Cache: MySQL and MariaDB provide a query cache mechanism that caches the results of SELECT queries. When a query is executed, MySQL/MariaDB checks if the identical query has been executed before and if the result is present in the cache. If so, it returns the cached result instead of executing the query, improving query response time. However, note that the query cache feature has limitations and may not be suitable for all workloads. In fact, starting from MySQL 8.0, the query cache feature has been deprecated.

2. InnoDB Buffer Pool: InnoDB is the default storage engine for both MySQL and MariaDB. It includes a buffer pool, which is an area in memory where data and index pages of InnoDB tables are cached. The buffer pool reduces disk I/O by caching frequently accessed data, improving read and write performance. The size of the buffer pool can be configured to optimize memory usage based on the database workload.

3. Key Cache: In MySQL (not available in MariaDB), the MyISAM storage engine provides a key cache mechanism. The key cache caches index blocks for MyISAM tables, reducing disk I/O for index lookups and improving performance. However, it's worth noting that MyISAM is not the default storage engine in recent versions of MySQL and is being phased out in favor of InnoDB.

4. Connection Pooling: MySQL and MariaDB support connection pooling mechanisms that allow database connections to be reused rather than establishing a new connection for each client request. Connection pooling improves performance by reducing the overhead of establishing and tearing down connections, especially in web applications with multiple concurrent clients.

5. Table and Index Caching: Both MySQL and MariaDB utilize various caching mechanisms at the storage engine level. For example, InnoDB uses an adaptive hash index to cache frequently accessed index pages in memory, improving index lookup performance. Additionally, InnoDB and MyISAM support caching of table metadata and data dictionary information to speed up table operations and reduce disk I/O.

These built-in mechanisms in MySQL and MariaDB help optimize performance by caching data, index pages, and query results, as well as providing connection pooling capabilities. Proper configuration and tuning of these mechanisms based on the specific database workload and requirements can significantly enhance performance and scalability.



Microsoft SQL Server, a popular commercial RDBMS, offers several built-in mechanisms to support caching and optimize performance. Here are some of the key features:

1. Buffer Pool: SQL Server utilizes a buffer pool mechanism to cache data pages in memory. The buffer pool reduces disk I/O by holding frequently accessed data pages, improving read performance. SQL Server employs a least recently used (LRU) algorithm to manage the buffer pool, automatically determining which data pages to keep in memory based on their usage patterns.

2. Query Plan Cache: SQL Server maintains a query plan cache to store execution plans for frequently executed SQL queries. When a query is executed, SQL Server first checks if the identical query has been executed before and if the execution plan is already in the cache. If so, it reuses the cached execution plan instead of generating a new one, improving query execution time.

3. Columnstore Indexes: SQL Server offers columnstore indexes, which are designed to improve query performance for data warehousing and analytical workloads. Columnstore indexes store and compress data by column rather than by row, allowing for highly efficient data retrieval and query execution for analytical queries.

4. In-Memory OLTP: SQL Server provides an in-memory OLTP (Online Transaction Processing) feature, also known as Hekaton. It allows certain tables and stored procedures to be stored and processed in memory, providing extremely fast data access and transaction processing. In-memory OLTP can significantly improve the performance of high-concurrency, low-latency transactional workloads.

5. TempDB Optimization: SQL Server's TempDB is a system database used for temporary storage during query execution, sorting, and other operations. SQL Server offers various configuration options and best practices to optimize TempDB performance, such as proper sizing, file placement, and enabling trace flag optimizations.

6. Resource Governor: SQL Server includes a Resource Governor feature that allows administrators to allocate and manage resources (CPU, memory, and I/O) among different workloads or user-defined resource pools. Resource Governor helps ensure that critical queries or applications receive the necessary resources, preventing resource contention and improving overall performance.

These built-in mechanisms in SQL Server help optimize performance by caching data pages, query plans, and utilizing specialized index structures. Additionally, features like in-memory processing and resource management contribute to improved performance for specific workloads. Proper configuration, tuning, and utilization of these mechanisms based on the specific database workload and requirements can enhance SQL Server's performance and scalability.




SQLite, a self-contained, serverless, and embedded RDBMS, offers several built-in mechanisms to support caching and optimize performance. Here are some of the key features:

1. Page Cache: SQLite utilizes a page cache mechanism to cache database pages in memory. The page cache reduces disk I/O by holding frequently accessed data and index pages, improving read performance. SQLite automatically manages the page cache and uses an LRU algorithm to determine which pages to keep in memory based on their usage patterns.

2. Statement Cache: SQLite provides a statement cache feature that caches compiled SQL statements. When a statement is executed, SQLite checks if the identical statement has been executed before and if the compiled form is already in the cache. If so, it reuses the cached statement, eliminating the need for recompilation and improving execution time.

3. Write-Ahead Logging (WAL): SQLite offers the Write-Ahead Logging mode, which enhances write performance. In this mode, changes are written to a separate log file (WAL file) before modifying the main database file. This mechanism allows concurrent reads and writes and reduces disk I/O by batching and writing changes in larger chunks, improving overall performance.

4. Automatic Indexes: SQLite has the ability to automatically create temporary indexes to optimize query execution. When executing a query, SQLite analyzes the query and determines if creating an index on certain columns would improve performance. If so, it creates a temporary index for that specific query, optimizing the execution plan.

5. Query Planner: SQLite includes a query planner that analyzes the query and determines the most efficient execution plan. The query planner takes into account available indexes, statistics, and other factors to generate an optimal plan for query execution.

6. PRAGMA Statements: SQLite provides PRAGMA statements, which are special commands that allow fine-grained control and tuning of various database parameters and behaviors. For example, PRAGMA cache_size can be used to adjust the size of the page cache, PRAGMA journal_mode can be used to control the journaling mode, and PRAGMA synchronous can be used to adjust the synchronization behavior between transactions and disk.

These built-in mechanisms in SQLite help optimize performance by caching pages, statements, and utilizing efficient logging and indexing strategies. SQLite's lightweight design and simplicity make it suitable for embedded and resource-constrained environments. Proper utilization of these mechanisms and understanding the impact of different PRAGMA settings can enhance SQLite's performance for various applications and use cases.




Microsoft Access, a desktop database management system, offers several built-in mechanisms to support caching and optimize performance. Here are some of the key features:

1. Page Cache: Access utilizes a page cache mechanism to cache frequently accessed data pages in memory. The page cache reduces disk I/O by holding data pages in memory, improving read performance. Access automatically manages the page cache and uses an LRU (Least Recently Used) algorithm to determine which pages to keep in memory based on their usage patterns.

2. Query Execution Plan: Access generates and caches the execution plan for queries. The execution plan outlines the steps and methods used to retrieve and process data for a query. By caching the execution plan, Access avoids the need to recompile the query each time it is executed, improving query execution time.

3. Compact and Repair Database: Access provides a "Compact and Repair Database" utility that optimizes the database file structure. This process removes unused space, reorganizes data pages, and resolves potential database corruption issues, leading to improved performance and reduced file size.

4. Indexing: Access supports indexing of tables to improve query performance. Indexes allow for faster data retrieval by creating a sorted data structure based on indexed columns. By utilizing indexes, Access can quickly locate and retrieve data, especially when searching or sorting based on indexed columns.

5. Temporary Tables: Access allows the creation and use of temporary tables, which are transient tables stored in memory. Temporary tables can be used to store intermediate results during complex queries or calculations, reducing the need for repeated calculations and improving overall query performance.

6. Query Optimization: Access includes a query optimizer that analyzes queries and generates an efficient execution plan. The optimizer considers available indexes, statistics, and other factors to determine the most efficient way to execute a query, optimizing performance.

7. Linked Tables: Access supports linking tables from external data sources, such as other databases or spreadsheets. By linking tables, Access can leverage the caching and performance optimizations provided by the external data source, improving overall query performance.

These built-in mechanisms in Access help optimize performance by caching data pages, execution plans, and utilizing indexing and query optimization techniques. It's important to note that Access is primarily designed for small-scale and desktop-oriented database applications and may have limitations in terms of scalability and performance compared to server-based RDBMS. Proper utilization of these mechanisms and regular maintenance, such as compacting and repairing the database, can help maximize performance in Access applications.



