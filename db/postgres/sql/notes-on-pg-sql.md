Run this in pg to (re)learn about window function "order by" part

```sql
select relkind, oid::int4, sum(oid::int4) over (partition by relkind order by oid::int4) from pg_class;
```