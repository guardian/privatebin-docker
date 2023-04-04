import { join } from "path";
import type { GuStackProps } from "@guardian/cdk/lib/constructs/core";
import { GuStack } from "@guardian/cdk/lib/constructs/core";
import type { App } from "aws-cdk-lib";
import { ContainerImage, RepositoryImageProps, } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService, ApplicationLoadBalancedFargateServiceProps, ApplicationLoadBalancedTaskImageOptions } from "aws-cdk-lib/aws-ecs-patterns";

export class PrivatebinDocker extends GuStack {
  constructor(scope: App, id: string, props: GuStackProps) {
    super(scope, id, props);
    const imageProps: RepositoryImageProps = {
    }

    const imageOptions: ApplicationLoadBalancedTaskImageOptions = {
      image: ContainerImage.fromRegistry("privatebin/nginx-fpm-alpine:1.5.1")
    }
    const fargateProps: ApplicationLoadBalancedFargateServiceProps = {publicLoadBalancer: true}
    const pb = new ApplicationLoadBalancedFargateService(this, "privatebin")
  }
}


