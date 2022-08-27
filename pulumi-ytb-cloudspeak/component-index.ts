import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { ResourceOptions } from "@pulumi/pulumi";

class Auth extends pulumi.ComponentResource {

  public userPoolName
  public clientId

  constructor(name: string, opts?: ResourceOptions) {
    super('org:utils:Auth', name, {}, opts)

    const pool = new aws.cognito.UserPool('user-pool', {}, {
      parent: this
    });

    const client = new aws.cognito.UserPoolClient('user-pool-client', {
      userPoolId: pool.id
    }, {
      parent: this
    })

    this.userPoolName = pool.name
    this.clientId = client.id

    this.registerOutputs({
      userPoolName: this.userPoolName,
      clientId: this.clientId
    })
  }
}

const auth = new Auth('my-auth')

const bucket = new aws.s3.Bucket('my-bucket', {
  bucket: pulumi.all([auth.userPoolName, auth.clientId])
                  .apply(([poolName, clientId]) => `org-${poolName}-${clientId}`)
})