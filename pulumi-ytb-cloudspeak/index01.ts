import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { getStack } from "@pulumi/pulumi";

const config = new pulumi.Config()

// will throw error if not found
// const customBucketName = config.require('bucketName')

// use get method, will just return undefined if not found
const customBucketName = config.get('bucketName') || 'default-bucket-name'

// Get config by namespace
const awsConfig = new pulumi.Config('aws')
awsConfig.get('region')

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket", {
  // bucket: `my-bucket-cloudspeak-${getStack()}`
  bucket: customBucketName
});

// const firehoseRole = new aws.iam.Role("firehose-role", {assumeRolePolicy: `{
//   "Version": "2012-10-17",
//   "Statement": [
//     {
//       "Action": "sts:AssumeRole",
//       "Principal": {
//         "Service": "firehose.amazonaws.com"
//       },
//       "Effect": "Allow",
//       "Sid": ""
//     }
//   ]
// }
// `});

// const firehose = new aws.kinesis.FirehoseDeliveryStream('s3', {
//   destination: 's3',
//   s3Configuration: {
//     bucketArn: bucket.arn,
//     roleArn: firehoseRole.arn
//   }
// }, {
//   dependsOn: [bucket]
// })

// Export the name of the bucket
export const bucketName = bucket.id;
