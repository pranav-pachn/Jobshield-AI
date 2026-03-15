/**
 * Logging utility for consistent, minimal logging across the application.
 * Used for [Component] tracking without debug spam.
 */

type LogLevel = "info" | "warn" | "error";

interface LogOptions {
  level?: LogLevel;
  data?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Log an info message
   */
  info(component: string, message: string, options?: Omit<LogOptions, "level">) {
    this.log(component, message, "info", options);
  }

  /**
   * Log a warning
   */
  warn(component: string, message: string, options?: Omit<LogOptions, "level">) {
    this.log(component, message, "warn", options);
  }

  /**
   * Log an error
   */
  error(component: string, message: string, options?: Omit<LogOptions, "level">) {
    this.log(component, message, "error", options);
  }

  /**
   * Internal log function
   */
  private log(
    component: string,
    message: string,
    level: LogLevel = "info",
    options?: Omit<LogOptions, "level">
  ) {
    // Always allow error logs, but filter others in production
    if (!this.isDevelopment && level !== "error") {
      return;
    }

    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const prefix = `[${timestamp}] [${component}]`;
    const logMessage = `${prefix} ${message}`;

    switch (level) {
      case "error":
        console.error(logMessage, options?.data ?? "");
        break;
      case "warn":
        console.warn(logMessage, options?.data ?? "");
        break;
      case "info":
      default:
        console.log(logMessage, options?.data ?? "");
        break;
    }
  }
}

export const logger = new Logger();
