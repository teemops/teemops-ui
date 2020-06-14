#!/bin/sh
grunt build
aws s3 sync dist/ s3://teemops-app-ui-s3bucketforwebsitecontent-1gs4f5mktmqbs/ --acl public-read
aws cloudfront create-invalidation \
    --distribution-id E3BAVZR1F0DXOQ \
    --paths "/*"