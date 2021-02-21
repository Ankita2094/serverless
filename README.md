# serverless

Publish Subscribe system with SNS and lambda function. When the user add/update/delete a qestion or a file or an answer a message is published to the SNS topic,
the lambda function checks the entry of the email in DynamoDB if it has no entry then it inserts a record with a TTL of 15 minutes and sends the notification to the user with SES


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
