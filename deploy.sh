#!/usr/bin/bash
set -e
yarn build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:TheDeaX-Lab/vk_pikap_master.git master
cd --
