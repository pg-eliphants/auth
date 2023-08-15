# auth
authentication service based with postgres backend

Ngrok for the win
https://ngrok.com/ (recommended by chatGPT, lol)

Some ideas to create users for the postgres driver test

```sql
create role nossl with login noreplication connection limit -1 password 'nossl';
create role ssl with login noreplication connection limit -1 password 'sll';
create role nopasswd with login noreplication connection limit -1 password null;
```






