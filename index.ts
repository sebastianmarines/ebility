import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import { onObjectCreatedHandler } from "./handler";

const bucket = new aws.s3.Bucket("ebility-coding-challenge");

bucket.onObjectCreated("onObjectCreated", onObjectCreatedHandler, {
    filterPrefix: "uploads/",
});

export const bucketName = bucket.id;

