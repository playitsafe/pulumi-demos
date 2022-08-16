# crop image
- create s3
- use s3 `onObjectCreated` event to trigger a lambda function
- aws s3 cp ~/Downloads/xx.jpg s3://(pulumi stack output bucketName)