FROM jenkins/jenkins:lts

USER root

# התקנת curl, Docker.io, ו-Docker Compose
RUN apt-get update && \
    apt-get install -y curl docker.io && \
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

# הפוך את Jenkins למשתמש ברירת מחדל
USER jenkins
