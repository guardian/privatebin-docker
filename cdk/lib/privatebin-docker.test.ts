import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { PrivatebinDocker } from "./privatebin-docker";

describe("The PrivatebinDocker stack", () => {
  it("matches the snapshot", () => {
    const app = new App();
    const stack = new PrivatebinDocker(app, "PrivatebinDocker", { stack: "security", stage: "TEST" });
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
