# DevOps Project Setup Guide

## Prerequisites Installation

Before you start make sure you have applications (backend, frontend etc) with manifests and Jenkinsfile that build docker image and push it to the local Docker registry (see below).

I added a reactjs application and a nodejs application to this folder for example.

### 1. Docker Installation LINUX
```bash
# Update package index
sudo apt update

# Install Docker dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group ($USER - is your linux user)
sudo usermod -aG docker $USER
```

### 2. K3s Installation
```bash
# Install K3s
curl -sfL https://get.k3s.io | sh -

# Verify installation
sudo kubectl get nodes
```

### 3. Istio Installation
```bash
# Download Istio
curl -L https://istio.io/downloadIstio | sh -

# Move to Istio directory (replace X.Y.Z with actual version)
cd istio-X.Y.Z

# Add istioctl to PATH
export PATH=$PWD/bin:$PATH

# Install Istio with demo profile
istioctl install --set profile=demo -y

# Enable automatic sidecar injection for default namespace
kubectl label namespace default istio-injection=enabled

# Verify installation
kubectl get pods -n istio-system
```

### 4. Kiali Installation
```bash
# Install Kiali and other addons
kubectl apply -f samples/addons/kiali.yaml
kubectl apply -f samples/addons/prometheus.yaml
kubectl apply -f samples/addons/grafana.yaml
kubectl apply -f samples/addons/jaeger.yaml

# Wait for deployments to be ready
kubectl wait --for=condition=available --timeout=600s deployment/kiali -n istio-system

# Access Kiali dashboard (in a separate terminal)
istioctl dashboard kiali
```

### 5. ArgoCD Installation
```bash
# Create namespace for ArgoCD
kubectl create namespace argocd

# Apply ArgoCD manifests
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Get ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward ArgoCD UI (in a separate terminal)
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### 6. ArgoCD Configuration
1. Access ArgoCD UI at `https://localhost:8080`
2. Login with:
   - Username: admin
   - Password: (obtained from previous step)
3. Add Git Repository:
   - Go to Settings → Repositories
   - Click "Connect Repo"
   - Add your repository URL and credentials
4. Create New Application:
   - Click "New App"
   - Fill in:
     - Application Name: your-app-name
     - Project: default
     - Source: your repository URL
     - Path: ./manifests/
     - Destination: https://kubernetes.default.svc
     - Namespace: your-namespace

### 7. Monitoring Stack Installation

#### Install Helm (if not installed)
```bash
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

#### Install Prometheus Stack
```bash
# Add Prometheus repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create monitoring namespace
kubectl create namespace monitoring

# Install Prometheus stack (includes Grafana)
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring
```

#### Install Loki Stack
```bash
# Add Grafana repository
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Loki
helm install loki grafana/loki-stack --namespace monitoring
```

#### Access Monitoring Tools
```bash
# Port forward Grafana
nohup kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80 &

# Port forward Prometheus
nohup kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090 &
```

#### Expose Monitoring Services
```bash
# Apply NodePort services
kubectl apply -f k8s/monitoring-services.yaml

# Verify services are created
kubectl get svc -n monitoring

# Get node IP (if running locally, use localhost)
kubectl get nodes -o wide
```

### Monitoring Configuration

#### Grafana Setup
1. Access Grafana at `http://localhost:30300`
2. Default credentials:
   - Username: admin
   - Password: prom-operator
3. Add Data Sources:
   - Prometheus: `http://prometheus-operated:30090`
   - Loki: `http://loki:3100`

#### Import Dashboards
1. In Grafana, go to Dashboards → Import
2. Import useful dashboard IDs:
   - 315 (Kubernetes Cluster)
   - 7589 (Jenkins Performance)
   - 13639 (Loki Logs)

## Project Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ort-devops-project
```

### 2. Environment Setup
```bash
# Create a new .env file
touch .env

# Edit the .env file with your configurations
nano .env
```

example: 
```bash
BASE_URL_DEV=http://localhost:3010
APP_URL_DEV=http://localhost:3000
BASE_URL_PROD=https://yoururl.com/api
APP_URL_PROD=https://yoururl.com

DB_PASS=DB_Password
DB_USER=DB_User
DB_URL_PROD=DB_URL_Production
DB_URL_DEV=DB_URL_Development

JWT_KEY=JWT_KEY
REFRESH_TOKEN_KEY=REFRESH_TOKEN_KEY

MAIL_PASS=MAIL_Password
MAIL_USER=test@gmail.com

MAIL_USER2=test2@gmail.com
MAIL_PASS2=MAIL_Password

GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET
SESSION_SECRET=SESSION_SECRET
```

### 3. Start Jenkins and Agents
```bash
# Build and start containers
docker compose up -d

# Get initial Jenkins admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 4. Jenkins Configuration
1. Access Jenkins at `http://localhost:8081`
2. Enter the initial admin password
3. Install suggested plugins
4. Create admin user
5. Configure agents:
   - npm-node-agent
   - docker-agent
6. Configure the pipeline for backend & frontend
7. Make sure the image is the registry The local Docker registry is available at `localhost:5000`

### 5. Kubernetes ConfigMaps
```bash
# Create ConfigMap ($NAMESPACE - is the namespace of the project)
kubectl create configmap backend-cm --from-env-file=.env -n $NAMESPACE

# Verify ConfigMap
kubectl get configmaps
```

Make sure the ArgoCD Applications Synced and the Deployment manifest in the appliction with the env have:
```bash
          env:
            - name: YOUR_KEY
              valueFrom:
                configMapKeyRef:
                  name: backend-cm ## This is the name of the ConfigMap
                  key: YOUR_KEY
```

### Important URLs
- Jenkins: `http://localhost:8081`
- Docker Registry: `http://localhost:5000`
- Application URL (Dev): `http://localhost:30000`
- API URL (Dev): `http://localhost:30100`
- ArgoCD UI: `https://localhost:8080`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Grafana NodePort: `http://localhost:30300`
- Prometheus NodePort: `http://localhost:30090`
- Kiali Dashboard: `http://localhost:20001`

### Troubleshooting
1. If Docker agent fails to connect:
   - Check JENKINS_SECRET in docker-compose.yml
   - Verify Docker socket permissions

2. If npm-node-agent fails:
   - Verify Node.js installation
   - Check JENKINS_SECRET in docker-compose.yml

### Security Notes
- Change default credentials in production
- Secure your Docker registry
- Keep .env file secure and never commit to repository

### Monitoring Stack Verification
```bash
# Check Prometheus components
kubectl get pods -n monitoring | grep prometheus

# Check Loki components
kubectl get pods -n monitoring | grep loki

# Check Grafana
kubectl get pods -n monitoring | grep grafana
```

### Service Mesh Verification
```bash
# Check Istio components
kubectl get pods -n istio-system

# Verify Kiali and addons
kubectl get pods -n istio-system -l app=kiali
kubectl get pods -n istio-system -l app=prometheus
kubectl get pods -n istio-system -l app=grafana
kubectl get pods -n istio-system -l app=jaeger
```

### Troubleshooting Monitoring
1. If Prometheus fails to scrape:
   - Check ServiceMonitor configurations
   - Verify namespace labels
   
2. If Loki fails to receive logs:
   - Check Promtail configuration
   - Verify log sources permissions

3. If Grafana can't connect to data sources:
   - Check data source URLs
   - Verify network policies

### Troubleshooting Service Mesh
1. If sidecars are not injecting:
   - Verify namespace label: `kubectl get ns -L istio-injection`
   - Restart pods if needed: `kubectl rollout restart deployment <deployment-name>`

2. If Kiali shows no data:
   - Check Prometheus connection
   - Verify service mesh metrics are being collected