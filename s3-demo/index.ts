import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as fs from 'fs'
import * as path from 'path'
import * as mime from 'mime'

const DIR_TO_COPY = path.join(__dirname, 'app/public');

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket");

// 遍历app/public下的文件,拷贝到s3中
crawldirectory(DIR_TO_COPY, (filePath: string) => {
  const relativeFilePath = filePath.replace(DIR_TO_COPY + '/', '');
  let object = new aws.s3.BucketObject(relativeFilePath, {
    bucket,
    source: new pulumi.asset.FileAsset(filePath) || undefined,
    contentType: mime.getType(filePath) || undefined,
  })
})

function crawldirectory(dir: string, f: (_: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = `${dir}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      crawldirectory(filePath, f);
    }
    if (stat.isFile()) {
      f(filePath);
    }
  }
}

// Add policy to bucket
function publicReadPolicyForBucket(bucketName: any) {
  return JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [
          `arn:aws:s3:::${bucketName}/*`
        ]
      }
    ]
  });
}

let bucketPolicy = new aws.s3.BucketPolicy('demoPulumiBucketPolicy', {
  bucket: bucket.bucket,
  policy: bucket.bucket.apply(publicReadPolicyForBucket)
})

// Export the name of the bucket
export const bucketName = bucket.id;
export const url = bucket.websiteEndpoint;
