const formatMeta = (meta) => {
  if (!meta) {
    return "";
  }

  return ` ${JSON.stringify(meta)}`;
};

export const logger = {
  info(message, meta) {
    console.log(`[backend] ${message}${formatMeta(meta)}`);
  },

  warn(message, meta) {
    console.warn(`[backend] ${message}${formatMeta(meta)}`);
  },

  error(message, meta) {
    console.error(`[backend] ${message}${formatMeta(meta)}`);
  }
};
