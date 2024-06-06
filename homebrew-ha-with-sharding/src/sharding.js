import { Redis } from "ioredis"

  const cluster = new Redis.Cluster([
    { port: 7000, host: "127.0.0.1" },
    { port: 7001, host: "127.0.0.1" },
    { port: 7002, host: "127.0.0.1" },
    { port: 7003, host: "127.0.0.1" },
    { port: 7004, host: "127.0.0.1" },
    { port: 7005, host: "127.0.0.1" }
  ]);

  // Always start with 0
  await cluster.set("counter", 0);

  // Repeat for 1 hour
  for (let i=1; i<=3600; i++) {
    try {
      // Update the value 
      await cluster.incr("counter");

      // Wait five seconds for at least one replica acknowledges
      console.log(`${await cluster.wait(1, 5000)} replica(s) has acknowledged`)
      
      // Read it back and display
      console.log(`counter=${await cluster.get('counter')}`)
    } 
    catch (e) { console.log('.'); }
    // Delay for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await cluster.disconnect()

  /*
     ioredis
     https://github.com/redis/ioredis/tree/main
  */
