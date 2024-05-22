@echo off
start "7000"    /MIN redis-server ./conf/7000/redis.conf
start "7001"    /MIN redis-server ./conf/7001/redis.conf
start "7002"    /MIN redis-server ./conf/7002/redis.conf

start "7003"    /MIN redis-server ./conf/7003/redis.conf
start "7004"    /MIN redis-server ./conf/7004/redis.conf
start "7005"    /MIN redis-server ./conf/7005/redis.conf


redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 --cluster-replicas 1 --cluster-yes


redis-cli -p 7000 cluster nodes


redis-cli -p 7000 cluster slots

rem redis-cli -p 7000 -c
