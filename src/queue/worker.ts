import { Worker } from "bullmq";
import { FILE_PROCESSING_QUEUE, FileProcessingJobPayload } from "./jobs";
import { processFileJob } from "./processor";
import { getBullMQConnection } from "../database/redis.service";

export function startFileWorker() {
  const worker = new Worker<FileProcessingJobPayload>(
    FILE_PROCESSING_QUEUE,
    processFileJob,
    {
      connection: getBullMQConnection(),
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    console.log(`🎉 Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`💥 Job ${job?.id} failed:`, err);
  });

  console.log("✅ BullMQ Worker started");

  return worker;
}