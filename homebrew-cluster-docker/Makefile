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
	@echo "Redis Cluster Dockerize project automation helper for Windows version 1.0"
	@echo
	@echo "Targets:"
	@echo "	build		build image"
	@echo "	up  		start the cluster"
	@echo "	down 		stop the cluster"
	@echo "	ps 		show running containers"
	@echo "	logs		cluster logs"
	@echo 
	@echo "	create		create the cluster"
	@echo "	cmd		docker-compose exec re1 cmd"
	@echo "	cli 		docker-compose exec re1 redis-cli -c"
	@echo "	info		docker-compose exec re1 redis-cli cluster info"
	@echo "	config		edit configuration"

#
# build image
#
build:
	docker-compose build

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
# create the cluster (using redis-trib.rb)"
#
create: 
	redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 \
	127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
	--cluster-replicas 1

#
# start cmd on cluster operator
#
cmd:
	docker-compose exec re1 cmd

#
# start redis-cli on cluster node1
#
cli:
	docker-compose exec re1 redis-cli -c 

#
# cluster info
#
info:	
	docker-compose exec re1 redis-cli cluster info
	
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
# EOF (2024/05/31)
#

