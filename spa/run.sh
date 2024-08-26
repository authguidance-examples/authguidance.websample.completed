#!/bin/bash

#######################################
# A script to run webpack in watch mode
#######################################

cd "$(dirname "${BASH_SOURCE[0]}")"

npm start
if [ $? -ne 0 ]; then
  echo 'Problem encountered running the SPA'
  read -n 1
  exit 1
fi

#
# Prevent automatic terminal closure
#
read -n 1
