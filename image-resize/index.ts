import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as sharp from "sharp"

const WIDTH = 240;
const HEIGHT = 240;

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("photos");

bucket.onObjectCreated('onImageUploaded', async args => {
  console.log('onImageUpload called');
  if (!args.Records) return
  const s3 = new aws.sdk.S3()
  for (const rec of args.Records) {
    const [ buck, key ] = [ rec.s3.bucket.name, rec.s3.object.key ]
    if (key.startsWith('processed')) continue;

    console.log(`processing file ${key}`);
    const data = await s3.getObject({ Bucket: buck, Key: key }).promise()

    if (!data.Body) continue;
    const result = await sharp(data.Body as Buffer)
      .resize({
        width: WIDTH,
        height: HEIGHT,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention
      })
      .jpeg()
      .toBuffer();

    const newFileKey = `process/${key}`
    await s3.putObject({
      Bucket: buck,
      Key: newFileKey,
      Body: result,
    }).promise()
    console.log(`cropped image ${newFileKey}`);
  }
})

// Export the name of the bucket
export const bucketName = bucket.id;
