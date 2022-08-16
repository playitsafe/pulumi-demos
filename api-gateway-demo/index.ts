import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const zoneName = 'aarondev.me'
const appName = 'svelet'
const domainName = `${appName}.${zoneName}`

const api = new awsx.apigateway.API('mysite', {
  routes: [
    {
      /**
       * 把app/public下的文件路由到这个website的根目录`/`下
       * 相当于demo中将本地文件读取打包到s3中, 再把s3 bucket映射到api gateway
      **/ 
      localPath: 'app/public',
      path: '/'
    }
    //可以添加更多的routes, 可以让前端的app访问一个api,去触发一个lambda
  ]
})
// 为api gate way 设置自己的domain

// Note ACM runs on us-east-1
const provider = new aws.Provider('east', {region: 'us-east-1'});

const cert = pulumi.output(aws.acm.getCertificate({
  domain: `*.${zoneName}`
}, { async: true, provider }))

// 创建api gateway的domain
const apiGwDomain = new aws.apigateway.DomainName(appName, {
  certificateArn: cert.arn,
  domainName
})

//为zone下面创建record
const zone = pulumi.output(aws.route53.getZone({
  name: 'aarondev.me'
}, { async: true }))

const record = new aws.route53.Record(domainName, {
  name: appName,
  type: 'A',
  zoneId: zone.zoneId,
  aliases: [{
    name: apiGwDomain.cloudfrontDomainName,
    zoneId: apiGwDomain.cloudfrontZoneId,
    evaluateTargetHealth: true
  }]
})

const domainMapping = new aws.apigateway.BasePathMapping(`${appName}-apigw-mapping`, {
  restApi: api.restAPI.id,
  domainName: apiGwDomain.domainName,
  stageName: api.stage.stageName
})

export const apiUrl = api.url
export const domain = record.fqdn
export const siteUrl = pulumi.interpolate`https://${domain}`

