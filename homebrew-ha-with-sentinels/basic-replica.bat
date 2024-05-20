@echo off
start "primary" /MIN redis-server primary.conf 
start "replica 1" /MIN redis-server replica1.conf 
start "replica 2" /MIN redis-server replica2.conf 