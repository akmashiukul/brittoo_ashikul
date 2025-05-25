#!/bin/bash

if [ "$1" == "run" ]; then
  if [ "$2" == "all" ]; then
    docker compose -f docker-compose-prod.yml up -d

  elif [ "$2" == "client" ]; then
    docker run -d -p 8080:80 --name britto-client-prod-cnt1 britto-client-prod

  elif [ "$2" == "server" ]; then
    docker run -d -p 5000:5000 --env-file ./server/.env --name britto-server-prod-cnt1 britto-server-prod

  fi

elif [ "$1" == "stop" ]; then
  if [ "$2" == "client" ]; then
    docker rm -fv britto-client-prod-cnt1

  elif [ "$2" == "server" ]; then
    docker rm -fv britto-server-prod-cnt1

  elif [ "$2" == "all" ]; then
    docker compose -f docker-compose-prod.yml down -v

  fi

else
  echo "Usage: $0 run [all|client|server] | stop [all|client|server]"
fi
