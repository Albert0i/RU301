
Subject: 
City M, inhabitants are required to make a declaration of blah blah blah at least every 24 hours. Applicants will first visit a web page, fill in baskc information and confirm on certain terms, press submit button. Upon a successful submission, a pass code is granted. 

All government departments, private sectors, facilities, banks, schools, stations etc are responsible for the checking and any illegal entering or reluctant to cooperate will be charged and put in prison. 

Local population is around 60,000, peak hour is around 7:30AM to 8:30AM every morning. A database is required to sustain 10.000 read/write operation per second. Every inhabitant is expected to spend only a couple of minutes to finish with. 

Supposes every read/write operation in Redis is 1 ms. In the other words, a Redis server can serve 1000 read/write operations per second. 10,000 means at least 9 shards, 9 primary nodes and every primary node requires 2 replicas. A total of 27 nodes are needed. 


2024/06/11



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



