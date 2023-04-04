import { GuCertificate } from "@guardian/cdk/lib/constructs/acm";
import type { GuStackProps } from "@guardian/cdk/lib/constructs/core";
import { GuStack } from "@guardian/cdk/lib/constructs/core";
import { GuCname } from "@guardian/cdk/lib/constructs/dns";
import { SubnetType as GuSubnetType, GuVpc } from "@guardian/cdk/lib/constructs/ec2";
import{ GuApplicationLoadBalancer} from "@guardian/cdk/lib/constructs/loadbalancing/alb"
import type { App} from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import type { ISubnet} from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import type { ApplicationLoadBalancedFargateServiceProps, ApplicationLoadBalancedTaskImageOptions } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

export class PrivatebinDocker extends GuStack {
  constructor(scope: App, id: string, privateBinVersion: string, props: GuStackProps) {
    super(scope, id, props);

    const app = "privatebin"
    const domainName = `${app}.code.dev-gutools.co.uk`
    const vpc = GuVpc.fromIdParameter(this, "vpc")
    const publicLbSubnets: ISubnet[] = GuVpc.subnetsFromParameter(this, { type: GuSubnetType.PUBLIC })
    const privateSubnets: ISubnet[] = GuVpc.subnetsFromParameter(this, { type: GuSubnetType.PRIVATE })
    const imageName = "privatebin/nginx-fpm-alpine"

    const taskImageOptions: ApplicationLoadBalancedTaskImageOptions = {
      containerPort: 8080,
      //command: [`--restart="always" --read-only ${imageName}`],
      image: ContainerImage.fromRegistry(`${imageName}:${privateBinVersion}`)
    }

    const fargateProps: ApplicationLoadBalancedFargateServiceProps = {
      publicLoadBalancer: true,
      taskImageOptions,
      vpc,
      taskSubnets: { subnets: privateSubnets },
      certificate: new GuCertificate(this, { app, domainName, }),
      loadBalancer: new GuApplicationLoadBalancer(this, `${app}ALB`, {app, vpc, internetFacing: true,  vpcSubnets: { subnets: publicLbSubnets }, deletionProtection: false})
    }
    const pb = new ApplicationLoadBalancedFargateService(this, `${app}Service`, fargateProps)

    new GuCname(this,
      `${app}Cname`,
      {
        app,
        domainName,
        ttl: Duration.minutes(1),
        resourceRecord: pb.loadBalancer.loadBalancerDnsName
      }
    )

  }
}


