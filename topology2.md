### On Topology

### Prologue 
This article is created from transscript of [RU301](https://redis.io/university/courses/ru301/) verbatim, not because of my laziness. But for the great significance and unstirrable value in the aforementioned narrative of the course. Nevertheless links and addenda will be appended whenever it is appropriate. 


### I. Introduction to High Availability
High availability is a computing concept describing systems that guarantee a high level of uptime: designed to be fault tolerant, highly dependable, operating continuously without intervention, and without a single point of failure.

What does this mean for Redis, specifically? Well, it means that if your primary Redis server fails, a backup will kick in, and you, as a user, will see little to no disruption in the service. 

There are two components needed for this to be possible, *replication* and *automatic failover*. Replication is a continuous copying of data from a primary database to a backup, or a replica database. The two databases are usually located on different physical servers, so that we can have a functional copy of our data in case we lose a server where our primary database sits. But having a backup of our data is not enough for high availability. We also have to have a mechanism that will automatically kick in and redirect all requests toward the replica in the event that the primary fails. This mechanism is called, *automatic failover*.


### II. Basic Replication
Replication in Redis follows a simple primary replica model where the replication happens in one direction, from the primary to one or multiple replicas. Data is only written to the primary instance, and replicas are kept in sync so that they are exact copies of the primaries.

To create a replica, you instantiate a Redis server instance with the configuration directive
of `replicaof` set to the address and port of the primary instance. Once the replica instance is up and running, the replica will try to sync with the primary. To transfer all of its data as efficiently as possible, 

1. the primary instance will produce a compacted version of the data as a snapshot in an RDB file and send it to the replica. The replica will then read the snapshot file and load all of its data into memory, which will bring it to the same state the primary instance had at the moment of creating the RDB file. 
2. When the loading stage is done, the primary instance will send the backlog of any write commands run since the snapshot was made.
3. Finally, the primary instance will send the replica a live stream of all subsequent commands. 

By default, replication is asynchronous. This means that if you send a write command to Redis, you will receive your acknowledged response first, and only then will the command be replicated to the replica. If the primary goes down after acknowledging a write but before the write can be replicated, then you might have data loss.

To avoid this, the client can use the [WAIT](https://redis.io/docs/latest/commands/wait/) command. This command blocks the current client until all the previous write commands are successfully transferred and acknowledged by at least some specified number of replicas. For example, if we send the command `WAIT 2 0`, the client will block or not return a response to the client until all the previous write commands issued on that connection have been written to at least two replicas. The second argument, 0, will instruct the server to block indefinitely. But we can set it to a number in milliseconds, so that it times out after a while and returns the number of replicas that successfully acknowledged the commands. 

Replicas are *read only*. This means that you can configure your clients to read from them, but you cannot write data to them. If you need additional read throughput, you can configure your Redis client to read from replicas as well as from your primary node. However, it's often easier just to scale out your cluster. This lets you scale reads and writes without writing any complex client logic. 

Also, you should know about active active, an advanced feature of Redis Enterprise and Redis Cloud. Active active replicates entire databases across geographically distributed clusters. With active active, you can write locally to any replica databases, and those writes will be reflected globally. Something to keep in mind when you're scaling out.


### III. Enabling Basic Replication
#### Step 1
First let’s create and configure the primary instance. We’ll start with a few configuration changes in its `primary.conf` configuration file.
```
$ touch primary.conf  # Create the configuration file
```

Now open the `primary.conf` file with your favourite text editor and set the following configuration directives:
```
# Create a strong password here
requirepass 123456

# AUTH password of the primary instance in case this instance becomes a replica
masterauth 123456

# Enable AOF file persistence
appendonly yes

# Choose a name for the AOF file
appendfilename "primary.aof"
```

Finally, let’s start the primary instance:
```
$ redis-server ./primary.conf
```

#### Step 2
Next, let’s prepare the configuration file for the replica:
```
$ touch replica.conf
```

Let’s add some settings to the file we just created:
```
# Port on which the replica should run
port 6380

# Address of the primary instance
replicaof 127.0.0.1 6379

# AUTH password of the primary instance
masterauth 123456

# AUTH password for the replica instance
requirepass 123456
```

And let’s start the replica:
```
$ redis-server ./replica.conf
```

#### Step 3
Open two terminal tabs and use them to start connections to the primary and replica instances:
```
# Tab 1 (primary)
$ redis-cli 
```

```
# Tab 2 (replica)
$ redis-cli -p 6380
```

Authenticate on both tabs by running the command AUTH followed by your password:
```
AUTH 123456
```

On the second (replica) tab run the `MONITOR` command which will allow you to see every command executed against that instance.

Go back to the first (primary) tab and execute any write command, for example
```
127.0.0.1:6379> SET foo bar
```

In the second tab you should see that the command was already sent to the replica:
```
1617230062.389077 [0 127.0.0.1:6379] "SELECT" "0"
1617230062.389092 [0 127.0.0.1:6379] "set" "foo" "bar"
```

#### Step 4
Keep the instances running, or at least their configuration files around. We’ll need them for the next section.


### IV. Understanding Sentinels
In the beginning of this article, we learned that we can’t have high availability without replication and automatic failover. We covered replication in the previous two sections, and now we’ll explain Sentinel - a tool that provides the automatic failover.

Redis Sentinel is a distributed system consisting of multiple Redis instances started in sentinel mode. We call these instances **Sentinels**.

The group of Sentinels monitors a primary Redis instance and its replicas. If the sentinels detect that the primary instance has failed, the sentinel processes will look for the replica that has the latest data and will promote that replica to be the new primary. This way, the clients talking to the database will be able to reconnect to the new primary and continue functioning as usual, with minimal disruption to the users.

![alt Sentinel Quorum Diagram](homebrew-ha-with-sentinels/img/sentinel.png)

#### Deciding that a primary instance is down
In order for the Sentinels to be able to decide that a primary instance is down we need to have enough Sentinels agree that the server is unreachable from their point of view.

Having a number of Sentinels agreeing that they need to take an action is called **reaching a quorum**. If the Sentinels can’t reach quorum, they cannot decide that the primary has failed. The exact number of Sentinels needed for quorum is configurable.

#### Triggering a failover
Once the Sentinels have decided that a primary instance is down, they need to elect and authorize a leader (a Sentinel instance) that will do the failover. A leader can only be chosen if the majority of the Sentinels agree on it.

In the final step, the leader will reconfigure the chosen replica to become a primary by sending the command `REPLICAOF NO ONE` and it will reconfigure the other replicas to follow the newly promoted primary.

#### Sentinel and Client Libraries
If you have a system that uses Sentinel for high availability, then you need to have a client that supports Sentinel. Not all libraries have this feature, but most of the popular ones do, so make sure you add it to your list of requirements when choosing your library.


### V. Replication with Sentinels 
#### Step 1
If you still have the primary and replica instances we set up in the previous section - great! We’ll reuse them to create our Sentinel setup. If not - refer back to the instructions and go through them again.

When done, you will have a primary Redis instance with one replica.

#### Step 2
To initialise a Redis Sentinel, you need to provide a configuration file, so let’s go ahead and create one:
```
$ touch sentinel1.conf
```

Open the file and paste in the following settings:
```
port 5000
sentinel monitor myprimary 127.0.0.1 6379 2
sentinel down-after-milliseconds myprimary 5000
sentinel failover-timeout myprimary 60000
sentinel auth-pass myprimary 123456
```

Breakdown of terms:

- port - The port on which the Sentinel should run
- sentinel monitor - monitor the Primary on a specific IP address and port. Having the address of the Primary the Sentinels will be able to discover all the replicas on their own. The last argument on this line is the number of Sentinels needed for quorum. In our example - the number is 2.
- sentinel down-after-milliseconds - how many milliseconds should an instance be unreachable so that it’s considered down
- sentinel failover-timeout - if a Sentinel voted another Sentinel for the failover of a given master, it will wait this many milliseconds to try to failover the same master again.
- sentinel auth-pass - In order for Sentinels to connect to Redis server instances when they are configured with requirepass, the Sentinel configuration must include the sentinel auth-pass directive.

#### Step 3
Make two more copies of this file - `sentinel2.conf` and `sentinel3.conf` and edit them so that the PORT configuration is set to 5001 and 5002, respectively.

#### Step 4
Let’s initialise the three Sentinels in three different terminal tabs:
```
# Tab 1
$ redis-server ./sentinel1.conf --sentinel

# Tab 2
$ redis-server ./sentinel2.conf --sentinel

# Tab3
$ redis-server ./sentinel3.conf --sentinel
```

#### Step 5
If you connected to one of the Sentinels now you would be able to run many new commands that would give an error if run on a Redis instance. For example:
```
# Provides information about the Primary
SENTINEL master myprimary

# Gives you information about the replicas connected to the Primary
SENTINEL replicas myprimary

# Provides information on the other Sentinels
SENTINEL sentinels myprimary

# Provides the IP address of the current Primary
SENTINEL get-master-addr-by-name myprimary
```

#### Step 6
If we killed the primary Redis instance now by pressing Ctrl+C or by running the `redis-cli -p 6379 DEBUG sleep 30` command, we’ll be able to observe in the Sentinels’ logs that the failover process will start in about 5 seconds. If you run the command that returns the IP address of the Primary again you will see that the replica has been promoted to a Primary:
```
redis> SENTINEL get-master-addr-by-name myprimary
1) "127.0.0.1"
2) "6380"
```


### VI. Clustering In Redis
Before we jump into the details, let's first address the elephant in the room. *DBAAS* offerings, or Database as a Service in the cloud. No doubt it's useful to know how Redis scales and how you might deploy it. But deploying and maintaining a Redis cluster is a fair amount of work.

So if you don't want to deploy and manage Redis yourself, then consider sir signing up for Redis Cloud, our managed service, and let us do the scaling for you. Of course, that route is not for everyone. And as I said, there's a lot to learn here. So let's dive in. We'll, start with scalability. Here's one definition.

> Scalability is the property of a system to handle a growing amount of work by adding resources to the system.

The two most common scaling strategies are *vertical scaling* and *horizontal scaling*. Vertical scaling, or also called scaling up, means adding more resources like CPUs or memory to your server. Horizontal scaling, or scaling out, implies adding more servers to your pool of resources. It's the difference between just getting a bigger server and deploying a whole fleet of servers.

Let's take an example. Suppose you have a server with 128 gigabytes of RAM, but you know that your database will need to store 300 gigabytes of data. In this case, you'll have two choices. You can either add more RAM to your server so it can fit the 300 gigabyte data set, or you can add two more servers and split the 300 gigabytes of data between the three of them.

Hitting your server's RAM limit is one reason you might want to scale up or out. But reaching the performance limits in terms of throughput or operations per second is another. Since Redis is mostly single-threaded, a single Redis Server instance cannot make use of the multiple cores of your server's CPU for command processing. But if we split the data between two Redis instances, our system can process requests in parallel, effectively doubling the throughput.

In fact, performance will scale close to linearly by adding more Redis instances to the system. This pattern of splitting data between multiple servers for the purpose of scaling is called *sharding*. The resulting servers or processes that hold chunks of the data are called **shards**. This performance increase sounds amazing,but it adds some complexity. If we divide and distribute our data across two shards, which are just two Redis Server instances, how will we know where to look for each key?

We need to have a way to consistently map a key to a specific shard. There are multiple ways to do this. And different databases adapt different strategies. The one Redis uses is called *algorithmic sharding*. And this is how it works. Define the shard for a given key. We hash the key and then mod the result by the total number of shards. Because we're using a deterministic hash function, this function will always assign a given key to the same shards. 

But what happens if we want to increase our shards count even further, a process commonly called *resharding*? Let's say we add one new shard so that our total number of shards is three. Now, when a client tries to read the key `foo`, they will run the hash function and mod the number of shards as before. This time, the number of shards is different and we're modding with three instead of two. Understandably, the result may be different, pointing us to the wrong shard.

Resharding is a common issue with the algorithmic sharding strategy. This can be solved by rehashing all the keys in the keys base and moving them to the shard appropriate to the new shard count. This is not a trivial task, though. And it can require a lot of time and resources, during which the database will not be able to reach its full performance or might even become unavailable. Redis uses a clever approach to solve this problem-- a logical unit that sits between a key and a shard called a *hashslot*. 

The total number of hashslots in a database is always 16,384, or 16K. The hashslots are divided roughly even across the shards. So, for example, slots 0 through 8,000 might be assigned to shard 1, and slots 8,001 to 16,384 might be assigned to shard 2. In a Redis cluster, we actually mod by the number of hashslots, not by the number of shards. Each key is assigned to a hashslot. When we do need to reshard, we simply move hashslots from one shard to another, distributing the data as required across the different Redis instances. 

Now that we know what sharding is and how it works in a Redis cluster, we can move on to high availability. Redis cluster is what provides sharding and high availability in open source Redis. High availability refers to the cluster's ability to remain operational even in the face of certain failures. For example, the cluster can detect when a primary shard fails and promote a replica to a primary without any manual intervention from the outside. But how does it do it? How does it that a primary shard has failed? And how does it promote its replica to the new primary? Say we have one replica for every primary shard.

If all our data is divided between three Redis Servers, we would need a six-membered cluster, with three primary shards and three replicas. All six shards are connected to each other over TCP and constantly ping each other and exchange messages. These messages allow the cluster to determine which shards are alive. When enough shards report that a given primary shard is not responding to them, they can agree to trigger a fail-over and promote the shard's replica to become the new primary. How many shards need to agree that a fellow shard is offline before fail-over is triggered? Well that's configurable. And you could set it up when you create a cluster. But there are some very important guidelines that you need to follow. To prevent something called a split brain situation in a Redis cluster, always keep an odd number of primary shards and two replicas per primary shard. Let me show you what I mean. The group on the left side will not be able to talk to the shards in the group on the right side. So the cluster will think that they are offline and will trigger a fail-over of any primary shards,
resulting in a left side with all primary shards. On the right side, the three shards will also see that the shards on the left as offline, and will trigger a fail-over on any primary shards that were on the left side, resulting in a right side
of all primary shards. Both sides, thinking they have all the primaries, will continue to receive client requests that modify data. And that is a problem, because maybe client A sets the key foo to bar on the left side, but a client B sets the same key's
value to baz on the right side. When the network partition is removed and the shards try to rejoin, we will have a conflict, because we have two shards holding different data, claiming to be the primary, and we wouldn't
know which data is valid. This is called a split brain situation, and it's a very common issue in the world of distributed systems. A popular solution is to always keep an odd number of shards in your cluster. Again, to prevent this kind of conflict, always keep the odd number of primary shards and two replicas per primary shard.


### VII. Persistence Options in Redis
If a Redis server that only stores data in RAM is restarted, all data is lost. To prevent such data loss, there needs to be some mechanism for persisting the data to disk. Redis provides two of them, snapshotting and an append-only file, or AOF. You can configure your Redis instance
to use either of the two or a combination of both. 

#### 1. Snapshot 
When a snapshot is created, the entire point in time via the data set is written to persistent storage
in a compact RDB file. You can set up recurring backups,
for example, every one, 12, or 24 hours, and use these backups to easily restore
different versions of the data set in case of disasters. You can also use these snapshots to create a clone of the server or simply leave them in place for a future restart.

Creating an RDB file requires a lot of disk IO. If performed in the main Redis process, this would reduce the server's performance. That's why this work is done by a forked child process.
But even forking can be time consuming if the data set is large. This may result in decreased performance or in Redis failing to serve clients for a few milliseconds or even up to a second for very large data sets. Understanding this should help you decide whether this solution makes sense for your requirements. You can configure the name and location of the RDB file
with the `dbfilename` and `dir` configuration directives, either through the redis.conf file or through the Redis CLI. And of course, you can configure how often you want to create a snapshot.
Here's an excerpt from the `redis.conf `file showing the default values.
```
################################ SNAPSHOTTING  ################################

# Save the DB to disk.
#
# save <seconds> <changes> [<seconds> <changes> ...]
#
# Redis will save the DB if the given number of seconds elapsed and it
# surpassed the given number of write operations against the DB.
#
# Snapshotting can be completely disabled with a single empty string argument
# as in following example:
#
# save ""
#
# Unless specified otherwise, by default Redis will save the DB:
#   * After 3600 seconds (an hour) if at least 1 change was performed
#   * After 300 seconds (5 minutes) if at least 100 changes were performed
#   * After 60 seconds if at least 10000 changes were performed
#
# You can set these explicitly by uncommenting the following line.
#
# save 3600 1 300 100 60 10000

# By default Redis will stop accepting writes if RDB snapshots are enabled
# (at least one save point) and the latest background save failed.
# This will make the user aware (in a hard way) that data is not persisting
# on disk properly, otherwise chances are that no one will notice and some
# disaster will happen.
#
# If the background saving process will start working again Redis will
# automatically allow writes again.
#
# However if you have setup your proper monitoring of the Redis server
# and persistence, you may want to disable this feature so that Redis will
# continue to work as usual even if there are problems with disk,
# permissions, and so forth.
stop-writes-on-bgsave-error yes

# Compress string objects using LZF when dump .rdb databases?
# By default compression is enabled as it's almost always a win.
# If you want to save some CPU in the saving child set it to 'no' but
# the dataset will likely be bigger if you have compressible values or keys.
rdbcompression yes

# Since version 5 of RDB a CRC64 checksum is placed at the end of the file.
# This makes the format more resistant to corruption but there is a performance
# hit to pay (around 10%) when saving and loading RDB files, so you can disable it
# for maximum performances.
#
# RDB files created with checksum disabled have a checksum of zero that will
# tell the loading code to skip the check.
rdbchecksum yes

# Enables or disables full sanitization checks for ziplist and listpack etc when
# loading an RDB or RESTORE payload. This reduces the chances of a assertion or
# crash later on while processing commands.
# Options:
#   no         - Never perform full sanitization
#   yes        - Always perform full sanitization
#   clients    - Perform full sanitization only for user connections.
#                Excludes: RDB files, RESTORE commands received from the master
#                connection, and client connections which have the
#                skip-sanitize-payload ACL flag.
# The default should be 'clients' but since it currently affects cluster
# resharding via MIGRATE, it is temporarily set to 'no' by default.
#
# sanitize-dump-payload no

# The filename where to dump the DB
dbfilename dump.rdb

# Remove RDB files used by replication in instances without persistence
# enabled. By default this option is disabled, however there are environments
# where for regulations or other security concerns, RDB files persisted on
# disk by masters in order to feed replicas, or stored on disk by replicas
# in order to load them for the initial synchronization, should be deleted
# ASAP. Note that this option ONLY WORKS in instances that have both AOF
# and RDB persistence disabled, otherwise is completely ignored.
#
# An alternative (and sometimes better) way to obtain the same effect is
# to use diskless replication on both master and replicas instances. However
# in the case of replicas, diskless is not always an option.
rdb-del-sync-files no

# The working directory.
#
# The DB will be written inside this directory, with the filename specified
# above using the 'dbfilename' configuration directive.
#
# The Append Only File will also be created inside this directory.
#
# Note that you must specify a directory here, not a file name.
dir ./
```
```
SAVE 60 1000 
```
As an example, this configuration will make Redis automatically dump the data set to disk every 60 seconds if at least 1,000 keys changed in that period. While snapshotting it is a great strategy for the use cases explained above, it leaves a huge possibility for data loss. You can configure snapshots to run every few minutes or after X writes against the database. But if the server crashes, you lose all the writes since the last snapshot was taken. In many use cases, that kind of data loss can be acceptable. But in many others, it is absolutely not. For all of the other use cases, 

#### 2. AOF 

Redis offers the AOF persistence option. AOF, or Append Only File, works by logging every incoming write command to disk as it happens. These commands can then be replayed to server startup to reconstruct the original data set. Commands are logged using the same format as the Redis protocol
itself in an append only fashion. 

The AOF approach provides greater durability than snapshotting and allows you to configure how often the syncs happen. Depending on your durability requirements, or how much data you can afford to lose, you can choose which FYSNC policy is best for your use case: 

- FYSNC every write, the safest policy. The write is acknowledged to the client only after it has been written to the AOF file and flushed to disk. Since in this approach, we are writing to disk synchronously, we can expect a much higher latency than usual. 

- FYSNC every second, the default policy. FYSNC is performed asynchronously in a background thread. So write performance is still high. Choose this option if you need high performance and can afford to lose up to one second worth of writes. 

- No FYSNC. In this case, Redis will log the command to the file descriptor but will not force the OS to flush the data to disk. If the OS crashes, we can lose a few seconds of data. Normally, Linux will flush data every 30 seconds with this configuration. But it's up to the kernel's exact tuning. The relevant configuration directives for AOF are shown on the screen.
```
############################## APPEND ONLY MODE ###############################

# By default Redis asynchronously dumps the dataset on disk. This mode is
# good enough in many applications, but an issue with the Redis process or
# a power outage may result into a few minutes of writes lost (depending on
# the configured save points).
#
# The Append Only File is an alternative persistence mode that provides
# much better durability. For instance using the default data fsync policy
# (see later in the config file) Redis can lose just one second of writes in a
# dramatic event like a server power outage, or a single write if something
# wrong with the Redis process itself happens, but the operating system is
# still running correctly.
#
# AOF and RDB persistence can be enabled at the same time without problems.
# If the AOF is enabled on startup Redis will load the AOF, that is the file
# with the better durability guarantees.
#
# Note that changing this value in a config file of an existing database and
# restarting the server can lead to data loss. A conversion needs to be done
# by setting it via CONFIG command on a live server first.
#
# Please check /operate/oss_and_stack/management/persistence for more information.

appendonly no

# The base name of the append only file.
#
# Redis 7 and newer use a set of append-only files to persist the dataset
# and changes applied to it. There are two basic types of files in use:
#
# - Base files, which are a snapshot representing the complete state of the
#   dataset at the time the file was created. Base files can be either in
#   the form of RDB (binary serialized) or AOF (textual commands).
# - Incremental files, which contain additional commands that were applied
#   to the dataset following the previous file.
#
# In addition, manifest files are used to track the files and the order in
# which they were created and should be applied.
#
# Append-only file names are created by Redis following a specific pattern.
# The file name's prefix is based on the 'appendfilename' configuration
# parameter, followed by additional information about the sequence and type.
#
# For example, if appendfilename is set to appendonly.aof, the following file
# names could be derived:
#
# - appendonly.aof.1.base.rdb as a base file.
# - appendonly.aof.1.incr.aof, appendonly.aof.2.incr.aof as incremental files.
# - appendonly.aof.manifest as a manifest file.

appendfilename "appendonly.aof"

# For convenience, Redis stores all persistent append-only files in a dedicated
# directory. The name of the directory is determined by the appenddirname
# configuration parameter.

appenddirname "appendonlydir"

# The fsync() call tells the Operating System to actually write data on disk
# instead of waiting for more data in the output buffer. Some OS will really flush
# data on disk, some other OS will just try to do it ASAP.
#
# Redis supports three different modes:
#
# no: don't fsync, just let the OS flush the data when it wants. Faster.
# always: fsync after every write to the append only log. Slow, Safest.
# everysec: fsync only one time every second. Compromise.
#
# The default is "everysec", as that's usually the right compromise between
# speed and data safety. It's up to you to understand if you can relax this to
# "no" that will let the operating system flush the output buffer when
# it wants, for better performances (but if you can live with the idea of
# some data loss consider the default persistence mode that's snapshotting),
# or on the contrary, use "always" that's very slow but a bit safer than
# everysec.
#
# More details please check the following article:
# http://antirez.com/post/redis-persistence-demystified.html
#
# If unsure, use "everysec".

# appendfsync always
appendfsync everysec
# appendfsync no

# When the AOF fsync policy is set to always or everysec, and a background
# saving process (a background save or AOF log background rewriting) is
# performing a lot of I/O against the disk, in some Linux configurations
# Redis may block too long on the fsync() call. Note that there is no fix for
# this currently, as even performing fsync in a different thread will block
# our synchronous write(2) call.
#
# In order to mitigate this problem it's possible to use the following option
# that will prevent fsync() from being called in the main process while a
# BGSAVE or BGREWRITEAOF is in progress.
#
# This means that while another child is saving, the durability of Redis is
# the same as "appendfsync no". In practical terms, this means that it is
# possible to lose up to 30 seconds of log in the worst scenario (with the
# default Linux settings).
#
# If you have latency problems turn this to "yes". Otherwise leave it as
# "no" that is the safest pick from the point of view of durability.

no-appendfsync-on-rewrite no

# Automatic rewrite of the append only file.
# Redis is able to automatically rewrite the log file implicitly calling
# BGREWRITEAOF when the AOF log size grows by the specified percentage.
#
# This is how it works: Redis remembers the size of the AOF file after the
# latest rewrite (if no rewrite has happened since the restart, the size of
# the AOF at startup is used).
#
# This base size is compared to the current size. If the current size is
# bigger than the specified percentage, the rewrite is triggered. Also
# you need to specify a minimal size for the AOF file to be rewritten, this
# is useful to avoid rewriting the AOF file even if the percentage increase
# is reached but it is still pretty small.
#
# Specify a percentage of zero in order to disable the automatic AOF
# rewrite feature.

auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# An AOF file may be found to be truncated at the end during the Redis
# startup process, when the AOF data gets loaded back into memory.
# This may happen when the system where Redis is running
# crashes, especially when an ext4 filesystem is mounted without the
# data=ordered option (however this can't happen when Redis itself
# crashes or aborts but the operating system still works correctly).
#
# Redis can either exit with an error when this happens, or load as much
# data as possible (the default now) and start if the AOF file is found
# to be truncated at the end. The following option controls this behavior.
#
# If aof-load-truncated is set to yes, a truncated AOF file is loaded and
# the Redis server starts emitting a log to inform the user of the event.
# Otherwise if the option is set to no, the server aborts with an error
# and refuses to start. When the option is set to no, the user requires
# to fix the AOF file using the "redis-check-aof" utility before to restart
# the server.
#
# Note that if the AOF file will be found to be corrupted in the middle
# the server will still exit with an error. This option only applies when
# Redis will try to read more data from the AOF file but not enough bytes
# will be found.
aof-load-truncated yes

# Redis can create append-only base files in either RDB or AOF formats. Using
# the RDB format is always faster and more efficient, and disabling it is only
# supported for backward compatibility purposes.
aof-use-rdb-preamble yes

# Redis supports recording timestamp annotations in the AOF to support restoring
# the data from a specific point-in-time. However, using this capability changes
# the AOF format in a way that may not be compatible with existing AOF parsers.
aof-timestamp-enabled no
```
AOF contains a log of all the operations that modify the database in a format that's easy to understand and parse. When the file gets too big, Redis can automatically rewrite it in the background, compacting it in a way that only the latest state of the data is preserved.

**Addendum**
When the file gets too big it can automatically rewrite it in the background, compacting it in a way that only the latest state of the data is preserved. If, for example, we have a counter key foo that changes state every few minutes, we would have hundreds or thousands of log entries for that key for which we don’t care. We only need to know the latest state of the key and can delete the others.


### VIII. Summary 
If you do not make heavy usage on Redis or the basic tunning works fine, your journey should probably end here. Scaling only happens when certain system limits, ie. CPU, RAM, network bandwidth are reached in a single instance setting. 


### IX. Bibliography 
1. [Running Redis at scale, Redis University](https://redis.io/university/courses/ru301/)
2. [Redis configuration file example](https://redis.io/docs/latest/operate/oss_and_stack/management/config-file/)
3. [Node-Redis](https://www.npmjs.com/package/redis)
4. [ioredis](https://www.npmjs.com/package/ioredis)
5. [Christabel, BY SAMUEL TAYLOR COLERIDGE](https://www.poetryfoundation.org/poems/43971/christabel)


### Epilogue 
Time and money are two major factors which drive people forward. Oftentimes one either loses time or money and vice versa. On a sunny day, when a field trip is ruined by a broken car right in the way, what will you lose? It's your temper... 


### EOF (2024/06/05)