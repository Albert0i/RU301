@echo off
start "primary" /MIN redis-server ./conf/primary.conf 
start "replica 1" /MIN redis-server ./conf/replica1.conf 
start "replica 2" /MIN redis-server ./conf/replica2.conf 