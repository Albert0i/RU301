import { Redis } from "ioredis"

  const cluster = new Redis.Cluster([
    { port: 7000, host: "127.0.0.1" },
    { port: 7001, host: "127.0.0.1" },
    { port: 7002, host: "127.0.0.1" },
    { port: 7003, host: "127.0.0.1" },
    { port: 7004, host: "127.0.0.1" },
    { port: 7005, host: "127.0.0.1" }
  ]);

  for (let i=1; i<=120; i++) {
    try {
      console.log(await cluster.incr("counter"));
    } 
    catch (e) {
      console.log('.');
    }
    
    
    // imitate delay 
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await cluster.disconnect()


  /*
     ioredis
     https://github.com/redis/ioredis/tree/main
  */
