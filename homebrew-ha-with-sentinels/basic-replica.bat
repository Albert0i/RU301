@echo off
start "primary" /MIN redis-server primary.conf 
start "replica" /MIN redis-server replica.conf 