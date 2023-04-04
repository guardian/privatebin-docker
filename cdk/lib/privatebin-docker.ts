import { GuCertificate } from "@guardian/cdk/lib/constructs/acm";
import type { GuStackProps } from "@guardian/cdk/lib/constructs/core";
import { GuStack } from "@guardian/cdk/lib/constructs/core";
import { GuCname } from "@guardian/cdk/lib/constructs/dns";
import { GuVpc } from "@guardian/cdk/lib/constructs/ec2";
import{ GuApplicationLoadBalancer} from "@guardian/cdk/lib/constructs/loadbalancing/alb"
import type { App} from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { ISubnet, Port} from "aws-cdk-lib/aws-ec2";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import type { ApplicationLoadBalancedFargateServiceProps, ApplicationLoadBalancedTaskImageOptions } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

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
      containerPort: 8080,
      //command: [`--restart="always" -p 8080:8080 --read-only privatebin/nginx-fpm-alpine`],
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
      loadBalancer: new GuApplicationLoadBalancer(this, `${app}ALB`, {app, vpc, internetFacing: false,  vpcSubnets: {subnets}})
    }
    const pb = new ApplicationLoadBalancedFargateService(this, `${app}Service`, fargateProps)

    const cnameProps = {
      app,
      domainName,
      ttl: Duration.hours(1),
      resourceRecord: pb.loadBalancer.loadBalancerDnsName}
    new GuCname(this, `${app}Cname`, cnameProps)

    pb.loadBalancer.loadBalancerDnsName
  }
}


