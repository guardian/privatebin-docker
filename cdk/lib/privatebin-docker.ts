import type { GuStackProps } from "@guardian/cdk/lib/constructs/core";
import { GuStack } from "@guardian/cdk/lib/constructs/core";
import { GuVpc } from "@guardian/cdk/lib/constructs/ec2";
import { GuCname } from "@guardian/cdk/lib/constructs/dns";
import { GuCertificate } from "@guardian/cdk/lib/constructs/acm";
import { App, Duration } from "aws-cdk-lib";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import{ GuApplicationLoadBalancer} from "@guardian/cdk/lib/constructs/loadbalancing/alb"

import { ApplicationLoadBalancedFargateService, ApplicationLoadBalancedFargateServiceProps, ApplicationLoadBalancedTaskImageOptions } from "aws-cdk-lib/aws-ecs-patterns";
import { ISubnet, SubnetType } from "aws-cdk-lib/aws-ec2";

export class PrivatebinDocker extends GuStack {
  constructor(scope: App, id: string, props: GuStackProps) {
    super(scope, id, props);

    const app = "privatebin"
    const domainName = `${app}.code.dev-gutools.co.uk`
    const vpc = GuVpc.fromIdParameter(this, "vpc")
    const subnets: ISubnet[] = GuVpc.subnetsFromParameter(this)

    const certificate = new GuCertificate(this, {app,
      domainName,})

    const taskImageOptions: ApplicationLoadBalancedTaskImageOptions = {
      image: ContainerImage.fromRegistry("privatebin/nginx-fpm-alpine:1.5.1")
    }
    const fargateProps: ApplicationLoadBalancedFargateServiceProps = {
      //publicLoadBalancer: true,
      taskImageOptions,
      vpc,
      taskSubnets: {
        //subnetType: SubnetType.PRIVATE_ISOLATED,
        subnets },
      certificate,
      loadBalancer: new GuApplicationLoadBalancer(this, `${app}-alb`, {app, vpc, internetFacing: false,  vpcSubnets: {subnets}})
    }
    const pb = new ApplicationLoadBalancedFargateService(this, `${app}-service`, fargateProps)

    const cnameProps = {
      app,
      domainName,
      ttl: Duration.hours(1),
      resourceRecord: pb.loadBalancer.loadBalancerDnsName}
    new GuCname(this, `${app}-cname`, cnameProps)

    pb.loadBalancer.loadBalancerDnsName
  }
}


