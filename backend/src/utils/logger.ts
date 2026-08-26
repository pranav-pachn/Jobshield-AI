function formatMessage(level: "info" | "warn" | "error", message: string, meta?: unknown) {
  if (meta === undefined) {
    return `[${level}] ${message}`;
  }

  if (meta instanceof Error) {
    return `[${level}] ${message} | ${meta.message}`;
  }

  if (typeof meta === "string") {
    return `[${level}] ${message} | ${meta}`;
  }

  try {
    return `[${level}] ${message} | ${JSON.stringify(meta)}`;
  } catch {
    return `[${level}] ${message} | [unserializable metadata]`;
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => console.log(formatMessage("info", message, meta)),
  warn: (message: string, meta?: unknown) => console.warn(formatMessage("warn", message, meta)),
  error: (message: string, meta?: unknown) => console.error(formatMessage("error", message, meta)),
};
