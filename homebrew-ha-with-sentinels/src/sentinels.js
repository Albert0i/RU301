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

  for (let i=1; i<=120; i++) {
    console.log(await redis.incr("counter"));
    
    // imitate delay 
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await redis.disconnect()


  /*
     ioredis
     https://github.com/redis/ioredis/tree/main
  */
