import { Redis } from "ioredis"

const redis = new Redis({
    sentinels: [
      { host: "127.0.0.1", port:  5000 },
      { host: "127.0.0.1", port:  5001 },
      { host: "127.0.0.1", port:  5002 }      
    ],
    name: "myprimary", 
    password: "123456"
  });
  
  console.log(await redis.incr("counter"));
  
  await redis.disconnect()


  /*
     ioredis
     https://github.com/redis/ioredis/tree/main
  */