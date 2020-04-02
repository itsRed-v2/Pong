#! /bin/bash

kill $(ps aux| grep node|grep index.js |grep -v grep| awk '{print $2}')
node index.js&
