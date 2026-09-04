# AWS Deployment Guide for BuildForJob Backend

This guide outlines how to build, push, and deploy the backend Express/Bun container onto AWS.

---

## Prerequisites
1. **Docker**: Ensure Docker Desktop is running.
2. **AWS CLI**: Install it from [AWS CLI Documentation](https://aws.amazon.com/cli/).
3. **Configure Credentials**: Run `aws configure` and input your Access Key, Secret Key, and default Region.

---

## 🚀 ECR Push Automation (Using helper script)

We have created an automated script [`deploy.sh`](file:///Users/rupeshjagtap/projects/buildforjob/builtforjob-be/deploy.sh) in the root of the backend folder. Run it with your AWS Account ID and Region:

```bash
cd builtforjob-be
./deploy.sh <YOUR_AWS_ACCOUNT_ID> <YOUR_AWS_REGION>
```

This script will automatically:
1. Log you into ECR.
2. Create the ECR repository if it doesn't already exist.
3. Build the container for standard target deployment architecture (`linux/amd64`).
4. Tag and push the image to AWS ECR.

---

## 🛠️ AWS Deployment Options

### Option A: AWS App Runner (Recommended & Easiest)
App Runner is the easiest way to deploy containerized APIs on AWS without managing infrastructure.

1. Go to the **AWS App Runner** Console -> **Create service**.
2. Source: Select **Container registry** -> **Amazon ECR**.
3. Choose ECR repository name `builtforjob-be` and image tag `latest`.
4. Deployment settings: Choose **Automatic** (so pushing new ECR tags triggers auto-deploy).
5. Service configuration:
   - Port: `8080` (as defined in our Dockerfile)
   - Add environment variables (copy from your production `.env.prod`).
6. Click **Create & Deploy**. App Runner will provision host domains and SSL/HTTPS automatically.

---

### Option B: AWS ECS Fargate (Enterprise Grade)

If you prefer ECS Fargate:
1. Create an ECS Cluster:
   ```bash
   aws ecs create-cluster --cluster-name builtforjob-cluster
   ```
2. Define Task Definition (`task-definition.json`):
   ```json
   {
     "family": "builtforjob-task",
     "networkMode": "awsvpc",
     "containerDefinitions": [
       {
         "name": "builtforjob-be",
         "image": "<AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/builtforjob-be:latest",
         "portMappings": [
           {
             "containerPort": 8080,
             "hostPort": 8080
           }
         ],
         "essential": true
       }
     ],
     "requiresCompatibilities": [
       "FARGATE"
     ],
     "cpu": "256",
     "memory": "512"
   }
   ```
3. Register the task definition:
   ```bash
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```
4. Run the task / create service:
   ```bash
   aws ecs create-service \
       --cluster builtforjob-cluster \
       --service-name builtforjob-service \
       --task-definition builtforjob-task \
       --desired-count 1 \
       --launch-type FARGATE \
       --network-configuration "awsvpcConfiguration={subnets=[<SUBNET_1>,<SUBNET_2>],securityGroups=[<SEC_GROUP>],assignPublicIp=ENABLED}"
   ```

---

### Option C: AWS Lightsail Containers (Fixed Low Cost)
If you want fixed pricing starting at $7/month:
1. Create the container service:
   ```bash
   aws lightsail create-container-service --service-name builtforjob-service --power nano --scale 1
   ```
2. Deploy the container:
   Create a `container-deploy.json` with the following configuration:
   ```json
   {
     "containers": {
       "backend": {
         "image": "<AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/builtforjob-be:latest",
         "ports": {
           "8080": "HTTP"
         },
         "environment": {
           "DATABASE_URL": "...",
           "JWT_SECRET": "..."
         }
       }
     },
     "publicEndpoint": {
       "containerName": "backend",
       "containerPort": 8080
     }
   }
   ```
   Deploy it:
   ```bash
   aws lightsail create-container-service-deployment --service-name builtforjob-service --cli-input-json file://container-deploy.json
   ```
