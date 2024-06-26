build
```bash
docker build . -t ctnelson1997/cs571-su24-hw12-api
docker push ctnelson1997/cs571-su24-hw12-api
```

run
```bash
docker pull ctnelson1997/cs571-su24-hw12-api
docker run --name=cs571_su24_hw12_api -d --restart=always -p 38112:38112 -v /cs571/su24/hw12:/cs571 ctnelson1997/cs571-su24-hw12-api
```
