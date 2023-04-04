import "source-map-support/register";
import {GuRootExperimental} from "@guardian/cdk/lib/experimental/constructs"
import { PrivatebinDocker } from "../lib/privatebin-docker";

const app = new GuRootExperimental();
new PrivatebinDocker(app, "PrivatebinDocker-CODE", { stack: "security", stage: "CODE", env: {region: "eu-west-1"}});
