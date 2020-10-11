#! /bin/sh

npm run stop
ansible-playbook --user=etienne --inventory=hosts deploy.yaml
