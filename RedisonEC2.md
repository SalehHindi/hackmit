# Instructions for getting a redis server running on EC2

The instructions for getting Redis to work are as follows:
1. From a fresh Ubuntu EC2 instance (I use nano) run `sudo apt-get install redis-server`
2. Allow all inbound tcp traffic via the instance's security group via the management console.
3. Open `/etc/redis/redis.conf` with root and change `bind 127.0.0.1` to `bind 127.0.0.1`
4. Restart the server with `sudo service redis-server restart`
5. Test that it is working. `redis-cli -h XXXX ping` should return `PONG` where XXXX is the public DNS for your instance. 
