
### To delete node 7000 !

1. Check shards 
```
redis-cli --cluster check 127.0.0.1:7000

127.0.0.1:7000 (afd0dd49...) -> 0 keys | 5461 slots | 1 slaves.
127.0.0.1:7001 (77ceed99...) -> 0 keys | 5462 slots | 1 slaves.
127.0.0.1:7002 (ff2de134...) -> 0 keys | 5461 slots | 1 slaves.
[OK] 0 keys in 3 masters.
0.00 keys per slot on average.
>>> Performing Cluster Check (using node 127.0.0.1:7000)
M: afd0dd490bd7838c8bdda1b8201e1d90d8ffc6d9 127.0.0.1:7000
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: 16489f0702f20c7233394b730db1c27ea056d0a2 127.0.0.1:7003
   slots: (0 slots) slave
   replicates 77ceed99ca87c11c28424bacaaaee404a5bd9581
S: 13140bad99cf9eb5f31f25b3fec2ba32c722c143 127.0.0.1:7004
   slots: (0 slots) slave
   replicates ff2de1348ae142bfdb766f9718cc5c671dbecc7d
M: 77ceed99ca87c11c28424bacaaaee404a5bd9581 127.0.0.1:7001
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: b434eda615f660960e20942f662f3875ec616df8 127.0.0.1:7005
   slots: (0 slots) slave
   replicates afd0dd490bd7838c8bdda1b8201e1d90d8ffc6d9
M: ff2de1348ae142bfdb766f9718cc5c671dbecc7d 127.0.0.1:7002
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

2. Move slots of 7000 to 7002 
```
redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from afd0dd490bd7838c8bdda1b8201e1d90d8ffc6d9 --cluster-to ff2de1348ae142bfdb766f9718cc5c671dbecc7d --cluster-slots 5461 --cluster-yes


3. Check shards again
```
redis-cli --cluster check 127.0.0.1:7002

Could not connect to Redis at 127.0.0.1:7000: No connection could be made because the target machine actively refused it.
127.0.0.1:7002 (ff2de134...) -> 0 keys | 10922 slots | 2 slaves.
127.0.0.1:7001 (77ceed99...) -> 0 keys | 5462 slots | 1 slaves.
[OK] 0 keys in 2 masters.
0.00 keys per slot on average.
>>> Performing Cluster Check (using node 127.0.0.1:7002)
M: ff2de1348ae142bfdb766f9718cc5c671dbecc7d 127.0.0.1:7002
   slots:[0-5460],[10923-16383] (10922 slots) master
   2 additional replica(s)
M: 77ceed99ca87c11c28424bacaaaee404a5bd9581 127.0.0.1:7001
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: 16489f0702f20c7233394b730db1c27ea056d0a2 127.0.0.1:7003
   slots: (0 slots) slave
   replicates 77ceed99ca87c11c28424bacaaaee404a5bd9581
S: 13140bad99cf9eb5f31f25b3fec2ba32c722c143 127.0.0.1:7004
   slots: (0 slots) slave
   replicates ff2de1348ae142bfdb766f9718cc5c671dbecc7d
S: b434eda615f660960e20942f662f3875ec616df8 127.0.0.1:7005
   slots: (0 slots) slave
   replicates ff2de1348ae142bfdb766f9718cc5c671dbecc7d
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

4. Rebalance shard 
```
redis-cli --cluster rebalance 127.0.0.1:7002


```

4. Check shards thrice
```
redis-cli --cluster check 127.0.0.1:7002

Could not connect to Redis at 127.0.0.1:7000: No connection could be made because the target machine actively refused it.
127.0.0.1:7002 (ff2de134...) -> 0 keys | 8192 slots | 2 slaves.
127.0.0.1:7001 (77ceed99...) -> 0 keys | 8192 slots | 1 slaves.
[OK] 0 keys in 2 masters.
0.00 keys per slot on average.
>>> Performing Cluster Check (using node 127.0.0.1:7002)
M: ff2de1348ae142bfdb766f9718cc5c671dbecc7d 127.0.0.1:7002
   slots:[2730-5460],[10923-16383] (8192 slots) master
   2 additional replica(s)
M: 77ceed99ca87c11c28424bacaaaee404a5bd9581 127.0.0.1:7001
   slots:[0-2729],[5461-10922] (8192 slots) master
   1 additional replica(s)
S: 16489f0702f20c7233394b730db1c27ea056d0a2 127.0.0.1:7003
   slots: (0 slots) slave
   replicates 77ceed99ca87c11c28424bacaaaee404a5bd9581
S: 13140bad99cf9eb5f31f25b3fec2ba32c722c143 127.0.0.1:7004
   slots: (0 slots) slave
   replicates ff2de1348ae142bfdb766f9718cc5c671dbecc7d
S: b434eda615f660960e20942f662f3875ec616df8 127.0.0.1:7005
   slots: (0 slots) slave
   replicates ff2de1348ae142bfdb766f9718cc5c671dbecc7d
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

5. Remove a node 
```
redis-cli --cluster del-node 127.0.0.1:7002 afd0dd490bd7838c8bdda1b8201e1d90d8ffc6d9
redis-cli --cluster del-node 127.0.0.1:7002 b434eda615f660960e20942f662f3875ec616df8

cluster forget afd0dd490bd7838c8bdda1b8201e1d90d8ffc6d9
cluster forget b434eda615f660960e20942f662f3875ec616df8
cluster nodes

redis-cli --cluster forget 127.0.0.1:7002 afd0dd490bd7838c8bdda1b8201e1d90d8ffc6d9
```

6. Check shards FINAL
```
redis-cli --cluster check 127.0.0.1:7002

Could not connect to Redis at 127.0.0.1:7000: No connection could be made because the target machine actively refused it.
127.0.0.1:7002 (ff2de134...) -> 0 keys | 8192 slots | 1 slaves.
127.0.0.1:7001 (77ceed99...) -> 0 keys | 8192 slots | 1 slaves.
[OK] 0 keys in 2 masters.
0.00 keys per slot on average.
>>> Performing Cluster Check (using node 127.0.0.1:7002)
M: ff2de1348ae142bfdb766f9718cc5c671dbecc7d 127.0.0.1:7002
   slots:[2730-5460],[10923-16383] (8192 slots) master
   1 additional replica(s)
M: 77ceed99ca87c11c28424bacaaaee404a5bd9581 127.0.0.1:7001
   slots:[0-2729],[5461-10922] (8192 slots) master
   1 additional replica(s)
S: 16489f0702f20c7233394b730db1c27ea056d0a2 127.0.0.1:7003
   slots: (0 slots) slave
   replicates 77ceed99ca87c11c28424bacaaaee404a5bd9581
S: 13140bad99cf9eb5f31f25b3fec2ba32c722c143 127.0.0.1:7004
   slots: (0 slots) slave
   replicates ff2de1348ae142bfdb766f9718cc5c671dbecc7d
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```




```
Node 127.0.0.1:7000 replied with error:
ERR Target instance replied with error: MISCONF Redis is configured to save RDB snapshots, but it's currently unable to persist to disk. Commands that may modify the data set are disabled, because this instance is configured to report errors during writes if RDB snapshotting fails (stop-writes-on-bgsave-error option). Please check the Redis logs for details about the RDB error.

clusterManagerMoveSlot failed: ERR Target instance replied with error: MISCONF Redis is configured to save RDB snapshots, but it's currently unable to persist to disk. Commands that may modify the data set are disabled, because this instance is configured to report errors during writes if RDB snapshotting fails (stop-writes-on-bgsave-error option). Please check the Redis logs for details about the RDB error.
```

3. 
```
```