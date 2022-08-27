import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { getStack } from "@pulumi/pulumi";

const pool = new aws.cognito.UserPool('user-pool', {})

// id is an Output<string>, means will be string
pool.id

const client = new aws.cognito.UserPoolClient('user-pool-client', {
  userPoolId: pool.id
})


// Create an AWS resource (S3 Bucket)
// const bucket = new aws.s3.Bucket("my-bucket", {
//   bucket: client.id.apply(id => `bucket-${id}`)
// });

// const bucket = new aws.s3.Bucket("my-bucket", {
//   bucket: pulumi.all([ pool.name, client.id ]).apply(([ poolName, clientId ]) => `xx-${poolName}-${clientId}`)
// });

/** Interpolate */
const bucket = new aws.s3.Bucket('my-bucket', {
  bucket: pulumi.interpolate`my-${pool.name}-${client.id}`
})


export const bucketName = bucket.id;
