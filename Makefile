pname=oplete
appname=portal/app.js

run:
	nodemon $(appname) || node $(appname)

install:
	npm install
	npm install -g pm2
build:
	webpack -p
clean:
	sudo rm -rf node_modules
	sudo rm -rf data/*
	sudo rm -f nohup.out
ps:
	ps aux|grep $(pname)
stop:
	-pm2 delete $(appname)
start:
    make stop
	pm2 start $(appname) -i 0 -- production
start2:
    make stop
	pm2 start $(appname) -i 0
restart:
	make stop
	make start
monitor:
	pm2 monit $(appname)
logs:
	pm2 logs $(appname)
