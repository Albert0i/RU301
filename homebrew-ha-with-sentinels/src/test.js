import { Redis } from "ioredis"

const redis = new Redis({
    sentinels: [
      { host: "127.0.0.1", port:  5000 },
      { host: "127.0.0.1", port:  5001 },
      { host: "127.0.0.1", port:  5002 }      
    ],
    name: "myprimary", 
    password: "123456",
    preferredSlaves: [
      { host: "127.0.0.1", port:  6380 }, 
      { host: "127.0.0.1", port:  6381 }
    ]
  });

  // Always start with 0
  await redis.set("counter", 0);

  // Repeat for 1 hour
  for (let i=1; i<=3600; i++) {
    try {
      // Update the value 
      await redis.incr("counter");

      // Wait five seconds for at least one replica acknowledges
      console.log(`${await redis.wait(1, 5000)} replica(s) has acknowledged`)
      
      // Read it back and display
      console.log(`counter=${await redis.get('counter')}`)
    } 
    catch (e) {  console.log('.'); }
    // Delay for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await redis.disconnect()

  /*
     ioredis
     https://github.com/redis/ioredis/tree/main
  */
