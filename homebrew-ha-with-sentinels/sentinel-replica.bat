@echo off
start "primary" /MIN redis-server primary.conf 
start "replica 1" /MIN redis-server replica1.conf 
start "replica 2" /MIN redis-server replica2.conf 

start "sentinel 1" /MIN redis-server ./sentinel1.conf --sentinel
start "sentinel 2" /MIN redis-server ./sentinel2.conf --sentinel
start "sentinel 3" /MIN redis-server ./sentinel3.conf --sentinel