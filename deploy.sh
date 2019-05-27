#!/bin/bash
#Deploys to S3
#./deploy.sh bucket
s3 sync dist/* s3://$bucket