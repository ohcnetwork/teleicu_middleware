const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.log("Error Handler");
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const env = process.env.NODE_ENV;
  console.log(res.sentry);
  if (env === "development") {
    console.error(err);
    sendDevError(err, res);
  } else {
    sendProdError(err, res);
  }
};
