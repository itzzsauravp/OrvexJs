import os from "node:os";
import { YaloRequest, YaloResponse } from "../../core";

export function authLogger(req: YaloRequest, _res: YaloResponse) {
  const time = new Date();
  const body = req.body;
  console.log(`Login Credentails: ${JSON.stringify(body)} @ Time: ${time}`);
}

export function greetLogger(_req: YaloRequest, _res: YaloResponse) {
  console.log(`Hi there dear user, This is a greeter logger`);
}

export function requestLogger(req: YaloRequest, _res: YaloResponse) {
  const time = new Date();
  const url = req.url;
  console.log(`Accessing: ${url} @ Time: ${time}`);
}

export function healthLogger(_req: YaloRequest, _res: YaloResponse) {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const memUsage = process.memoryUsage();

  const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

  console.log("--- System Health Report ---");
  console.log(`Uptime:    ${(os.uptime() / 60 / 60).toFixed(2)} hours`);
  console.log(
    `CPU Load:  ${os
      .loadavg()
      .map((l) => l.toFixed(2))
      .join(", ")} (1m, 5m, 15m)`,
  );
  console.log(`OS Memory: ${toMB(usedMem)}MB / ${toMB(totalMem)}MB used`);

  console.log("--- Node.js Process Stats ---");
  console.log(`RSS:       ${toMB(memUsage.rss)}MB (Total memory allocated)`);
  console.log(`Heap:      ${toMB(memUsage.heapUsed)}MB / ${toMB(memUsage.heapTotal)}MB`);
  console.log(`External:  ${toMB(memUsage.external)}MB (C++ objects)`);
  console.log("-------------------------------\n");
  throw new Error("something happening");
}
