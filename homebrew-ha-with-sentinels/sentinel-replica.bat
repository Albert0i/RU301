@echo off
start "primary" /MIN redis-server ./conf/primary.conf 
start "replica 1" /MIN redis-server ./conf/replica1.conf 
start "replica 2" /MIN redis-server ./conf/replica2.conf 

start "sentinel 1" /MIN redis-server ./conf/sentinel1.conf --sentinel
start "sentinel 2" /MIN redis-server ./conf/sentinel2.conf --sentinel
start "sentinel 3" /MIN redis-server ./conf/sentinel3.conf --sentinel