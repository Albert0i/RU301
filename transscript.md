
Redis Server Overview
=====================
Learning this isn't just useful, it's
also genuinely interesting.
Sharding, replication, high availability,
and disaster recovery are all important concepts

And knowing about them makes you a better developer.


The speed Redis is famous for is mostly due to the fact
that Redis stores and serves data entirely
from RAM memory instead of disk, as most other databases do.
Another contributing factor is the predominantly
single-threaded nature.

Single threading avoids race conditions
and CPU-heavy context switching associated with threads.
Indeed, this means that open source Redis
can't take advantage of the processing
power of multiple CPU cores, although CPU is rarely
the bottleneck with Redis.

You are more likely to bump up against memory or network
limitations before hitting any CPU limitations.
That said, Redis Enterprise does let
you take advantage of all the cores on a single machine.

The reading and especially writing to a socket
are expensive operations.
So in Redis version 6.0, multi-threaded I/O
was introduced.
When this feature is enabled, Redis
can delegate the time spent reading and writing
to I/O sockets over to other threads,
freeing up cycles for storing and retrieving data,
and boosting overall performance by up to a factor of two
for some workloads.

The Command Line Tool: Redis-CLI
================================

Configuring a Redis Server
==========================
The self-documented Redis configuration file called `redis.conf` has been mentioned many times as an example of well written documentation. In this file you can find all possible Redis configuration directives, together with a detailed description of what they do and their default values.

You should always adjust the `redis.conf` file to your needs and instruct Redis to run based on it's parameters when running Redis in production.

The way to do that is by providing the path to the file when starting up your server:
```
$ redis-server./path/to/redis.conf
```
When you’re only starting a Redis server instance for testing purposes you can pass configuration directives directly on the command line:
```
$ redis-server --port 7000 --replicaof 127.0.0.1:6379
```
The format of the arguments passed via the command line is exactly the same as the one used in the `redis.conf` file, with the exception that the keyword is prefixed with --.

Note that internally this generates an in-memory temporary config file where arguments are translated into the format of `redis.conf`.

It is possible to reconfigure a running Redis server without stopping or restarting it by using the special commands `CONFIG SET` and `CONFIG GET`.
```
127.0.0.1:6379> CONFIG GET *

127.0.0.1:6379> CONFIG SET something

127.0.0.1:6379> CONFIG REWRITE
```
Not all the configuration directives are supported in this way, but you can check the output of the command `CONFIG GET *` first for a list of all the supported ones.

Note that modifying the configuration on the fly has no effects on the `redis.conf` file so at the next restart of Redis the old configuration will be used instead. If you want to force update the `redis.conf` file with your current configuration settings you can run the `CONFIG REWRITE` command, which will automatically scan your `redis.conf` file and update the fields which don't match the current configuration value.


Redis Clients
=============
The Redis.io client page lists over 200 client libraries
for more than 50 programming languages.

Client Performance Improvements
===============================
Connection management - Pooling
As we showed in the previous section, Redis clients are responsible for managing connections to the Redis server. Creating and recreating new connections over and over again, creates a lot of unnecessary load on the server. A good client library will offer some way of optimizing connection management, by setting up a connection pool, for example.

With connection pooling, the client library will instantiate a series of (persistent) connections to the Redis server and keep them open. When the application needs to send a request, the current thread will get one of these connections from the pool, use it, and return it when done.

![alt connection pool](homebrew-standalone/img/connection_pool.png)

So if possible, always try to choose a client library that supports pooling connections, because that decision alone can have a huge influence on your system’s performance.

Pipelining
As in any client-server application, Redis can handle many clients simultaneously.

Each client does a (typically blocking) read on a socket and waits for the server response. The server reads the request from the socket, parses it, processes it, and writes the response to the socket. The time the data packets take to travel from the client to the server, and then back again, is called network round trip time, or RTT.

If, for example, you needed to execute 50 commands, you would have to send a request and wait for the response 50 times, paying the RTT cost every single time. To tackle this problem, Redis can process new requests even if the client hasn't already read the old responses. This way, you can send multiple commands to the server without waiting for the replies at all; the replies are read in the end, in a single step.

![alt pipelining](homebrew-standalone/img/pipelining.png)

This technique is called pipelining and is another good way to improve the performance of your system. Most Redis libraries support this technique out of the box.












[Install Redis on Linux](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/)

[redis-windows](https://github.com/zkteco-home/redis-windows)

[Redis7.2.4-Homebrew](https://github.com/Albert0i/Redis7.2.4-Homebrew.git)




redis:7.2.4-nanoserver-20H2

albert0i/redis
Updated about 1 year ago
Version 3.2.100 on nanoserver (1909)

docker image tag redis:7.2.4-nanoserver-20H2 albert0i/redis:7.2.4-nanoserver-20H2
docker image push albert0i/redis:7.2.4-nanoserver-20H2

Version 7.2.4 on nanoserver (20H2)



docker image pull albert0i/redis:7.2.4-nanoserver-20H2