#!/bin/bash
export PATH=$PATH:/usr/local/bin

has() {
  type "$1" > /dev/null 2>&1
  return $?
}

if ! has "cnpm"; then
# install cnpm
  npm install -g cnpm@3.4.0 --registry=https://registry.npm.taobao.org
fi

if ! has "git"; then
# install git
   yum install -y git
fi


if ! has "pm2"; then
# install pm2
 npm install -g pm2
fi

if ! has "webpack"; then
# install webpack
  npm install webpack -g
fi

cd ..
echo 'cnpm installing ...'
cnpm install
echo 'kill old oplate ...'
#kill -9 $(ps aux | grep '\soplate\s' | awk '{print $2}')
pm2 delete all
echo 'delete data dist '
rm -rf ../data/  dist/ nohup.out
echo '... webpacking ...'
npm run dll && npm run webpack  && npm run server
echo 'start node (oplate) ...'
#nohup node app.js -p &
pm2 start app.js -i 1 -- p
