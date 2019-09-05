# EveryChat

##
Client request example

```
POST: http(s)://host:port/ec
(body: {
  i: [id],
  r: [room],
  m: [method],
  v: [data]
})
```

fallback mode
`GET: http(s)://host:port/ec?i=[id]&r=[room]&m=[method]&v=[data]`
