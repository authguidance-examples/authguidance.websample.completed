#!/bin/bash

######################################
# A script to get the API ready to run
######################################

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Download the API's dependencies
#
if [ ! -d 'node_modules' ]; then
  npm install
  if [ $? -ne 0 ]; then
    echo 'Problem encountered installing API dependencies'
    exit 1
  fi
fi

#
# Run code quality checks
#
npm run lint
if [ $? -ne 0 ]; then
  echo 'Problem encountered running API code quality checks'
  exit 1
fi