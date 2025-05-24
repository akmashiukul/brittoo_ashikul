FROM node:alpine3.20
WORKDIR /app

COPY package*.json ./

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "Development" ] \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . .


EXPOSE 5000

CMD [ "node", "index.js" ]


# Commands:
# 1. Show Images:
#   docker image ls
  
# 2. Show containers
#   docker ps
   
# 3. Build Image:
#   docker build -t britto-backend .
  
# 4. Run a container:
#   docker run -p 5000:5000 -d --name britto-backend-cnt1 britto-backend

# 5. Delete a running container or container and all associated volumes:
#   docker rm britto-backend-cnt1 -f
#   docker rm britto-backend-cnt1 -fv 

# 6. Run by Mounting Volume: host:container
#   docker run -v $(pwd):/app -p 5000:5000 -d --name britto-backend-cnt1 britto-backend

# 7. Mount volume but ignore node_modules - if we dlt node_modules in host.
#   docker run -v $(pwd):/app -v /app/node_modules -p 5000:5000 -d --name britto-backend-cnt1 britto-backend

# 7. Read Only BindMount - we can't create files in dockerbash and sync with host
#   docker run -v $(pwd):/app:ro -v /app/node_modules -p 5000:5000 -d --name britto-backend-cnt1 britto-backend

# 8. Go inside Docker /app dir in Bash:
#   docker exec -it britto-backend bash 
