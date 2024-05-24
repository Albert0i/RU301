### On Topology 

### Prologue 

### I. Introduction 

### II. Standalone 
redis.conf 
```
# Accept connections on the specified port, default is 6379
port 6379

# all available interfaces
bind * -::*                     

# max number of simultaneous clients
maxclients 10000

# memory size in bytes  
maxmemory 1288490188

# save 3600 1 300 100 60 10000

appendonly yes
appendfilename "appendonly.aof"

# appendfsync always
appendfsync everysec
# appendfsync no
```
[1.5 Initial Tuning](https://redis.io/university/courses/ru301/)
[2.1 Persistence Options in Redis](https://youtu.be/08V8KeXhZY4)

[3.1 Basic Replication](https://youtu.be/-osCdf90tRA)
[3.3 Understanding Sentinels](https://redis.io/university/courses/ru301/)

[4.0 Clustering in Redis](https://youtu.be/jJMJc9QZaoA)

[5.1 Data Points in Redis](https://redis.io/university/courses/ru301/)
[5.3 Identifying Issues](https://redis.io/university/courses/ru301/)

### III. HA with Sentinels 

### IV. HA with charded cluster 

### V. Summary 

### VI. Bibliography 
1. [Running Redis at scale, Redis University](https://redis.io/university/courses/ru301/)
2. [Redis configuration file example](https://redis.io/docs/latest/operate/oss_and_stack/management/config-file/)
3. [Redis Cluster Specification](https://redis-doc-test.readthedocs.io/en/latest/topics/cluster-spec/#overview-of-redis-cluster-main-components)
4. [ioredis](https://github.com/redis/ioredis)
5. [Sentinel client spec](https://redis.io/docs/latest/develop/reference/sentinel-clients/)
6. [Scale with Redis Cluster](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/)
7. [redis-windows](https://github.com/zkteco-home/redis-windows)
8. [RedisJson](https://github.com/zkteco-home/RedisJson)
9. [Hash Slot Resharding and Rebalancing for Redis Cluster](https://severalnines.com/blog/hash-slot-resharding-and-rebalancing-redis-cluster/)
10. [Christabel, BY SAMUEL TAYLOR COLERIDGE](https://www.poetryfoundation.org/poems/43971/christabel)


### Epilogue 

### EOF (2024/05/31)

