FROM jenkins/inbound-agent AS jnlp

FROM node

RUN apt-get update && apt-get install -y openjdk-17-jre git


COPY --from=jnlp /usr/local/bin/jenkins-agent /usr/local/bin/jenkins-agent
COPY --from=jnlp /usr/share/jenkins/agent.jar /usr/share/jenkins/agent.jar

ENTRYPOINT ["/usr/local/bin/jenkins-agent"]