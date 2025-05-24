FROM node:22-alpine
WORKDIR /app

COPY package*.json ./

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; then npm install; else npm install --only=production; fi


COPY . .


EXPOSE 5000

CMD [ "node", "index.js" ]


# Commands:
# 1. Show Images:
#   docker image ls
  
# 2. Show containers
#   docker ps
   
# 3. Build Image:
#   docker build -t britto-server .
  
# 4. Run a container:
#   docker run -p 5000:5000 -d --name britto-server-cnt1 britto-server

# 5. Delete a running container or container and all associated volumes:
#   docker rm britto-server-cnt1 -f
#   docker rm britto-server-cnt1 -fv 

# 6. Run by Mounting Volume: host:container
#   docker run -v $(pwd):/app -p 5000:5000 -d --name britto-server-cnt1 britto-server

# 7. Mount volume but ignore node_modules - if we dlt node_modules in host.
#   docker run -v $(pwd):/app -v /app/node_modules -p 5000:5000 -d --name britto-server-cnt1 britto-server

# 7. Read Only BindMount - we can't create files in dockerbash and sync with host
#   docker run -v $(pwd):/app:ro -v /app/node_modules -p 5000:5000 -d --name britto-server-cnt1 britto-server

# 8. Go inside Docker /app dir in Bash:
#   docker exec -it britto-server bash 
