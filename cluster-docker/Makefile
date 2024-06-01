#
# Import and expose environment variables
#
cnf ?= .env
include $(cnf)
export $(shell sed 's/=.*//' $(cnf))

#
# Main
#
.PHONY: help build up down ps logs 

help:
	@echo
	@echo "Usage: make TARGET"
	@echo
	@echo "Redis Cluster Dockerize project automation helper for Linux version 1.0"
	@echo
	@echo "Targets:"
	@echo "	up  		start the cluster"
	@echo "	down 		stop the cluster"
	@echo "	ps 		show running containers"
	@echo "	logs		cluster logs"
	@echo 
	@echo "	create		create the cluster"
	@echo "	creator		docker-compose exec creator bash"
	@echo "	cli 		docker-compose exec re1 redis-cli -c"
	@echo "	info		docker-compose exec re1 redis-cli cluster info"
	@echo "	nodes		docker-compose exec re1 redis-cli cluster nodes"
	@echo "	slots		docker-compose exec re1 redis-cli cluster slots"
	@echo "	config		edit configuration"

#
# start the cluster
#
up:
	docker-compose up -d --remove-orphans

#
# stop the cluster
#
down:
	docker-compose down -v

#
# show running containers 
#
ps:
	docker-compose ps

#
# cluster logs
#
logs:
	docker-compose logs 

#
# create the cluster
#
create: 
	docker-compose exec creator redis-cli --cluster create 192.168.1.11:6379 192.168.1.12:6379 \
	192.168.1.13:6379 192.168.1.14:6379 192.168.1.15:6379 192.168.1.16:6379 \
	--cluster-replicas 1

#
# start bash on cluster operator
#
re1:
	docker-compose exec re1 bash

#
# start redis-cli on cluster node1
#
cli:
	docker-compose exec re1 redis-cli -c 

#
# start bash on cluster node1
#
bash:
	docker-compose exec re1 bash

#
# cluster info
#
info:	
	docker-compose exec re1 redis-cli cluster info
	
#
# cluster nodes
#
nodes:	
	docker-compose exec re1 redis-cli cluster nodes

#
# cluster slots
#
slots:	
	docker-compose exec re1 redis-cli cluster slots

#
# edit configuration
#
config:
	nano .env

#
# Reference 
#
# 1. Multi-line bash commands in makefile
#    https://stackoverflow.com/questions/10121182/multi-line-bash-commands-in-makefile
# 2  Suppress echo of command invocation in makefile?
#    https://stackoverflow.com/questions/9967105/suppress-echo-of-command-invocation-in-makefile
#

#
# EOF (2024/06/01)
#

