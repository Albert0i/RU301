FROM mcr.microsoft.com/windows/nanoserver:20H2

WORKDIR /Data

USER ContainerAdministrator
RUN setx /M PATH "%PATH%;C:\Redis" &&\
    mkdir \Redis &&\ 
    cd \Redis 

COPY Redis-x64-7.2.4 /Redis 

USER ContainerUser
COPY redis.conf /Redis

CMD ["redis-server.exe","C:\\Redis\\redis.conf"]

EXPOSE 6379

#
# EOF (2022/04/08)
#