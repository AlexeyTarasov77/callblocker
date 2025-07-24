import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log('%s: Request from %s', new Date().toLocaleString(), req.ip);
  const startTime = performance.now();
  next();
  const processingTime = (performance.now() - startTime) / 1000;
  console.log(
    '%s: Request from %s succesfully processed, which took: %d seconds',
    new Date().toISOString(),
    req.ip,
    processingTime,
  );
}
