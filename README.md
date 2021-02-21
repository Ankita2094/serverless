# serverless
Repository for lambda function

TechStack :
NodeJs
AWS DynamoDB
AWS SNS
AWS SES

WEBAPP,AMI and INFRASTRUCTURE setup for application

1. Create a new ami by triggering github actions by making commit to your repositoryy
2. In infrastructure switch to main branch and create infrastructure by tyoing following command "terraform apply"
3. After infrastructure is setup trigger github actions for code deploy to run and setup webapp on all the EC2 instances present
4. Trigger github actions in serverless repository to setup/update lambda function and setup SNS and SES.
5. Destroy the infrastructure by command "terraform destroy"

ADD SECRETS To GITHUB BEFORE ALL THE SETUPS TO EVERY REPOSITORY:
AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
AWS_REGION
