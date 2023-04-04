import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { PrivatebinDocker } from "../lib/privatebin-docker";

const app = new App();
new PrivatebinDocker(app, "PrivatebinDocker-CODE", { stack: "security", stage: "CODE" });
