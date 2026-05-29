const formatMeta = (meta) => {
  if (!meta) {
    return "";
  }

  return ` ${JSON.stringify(meta)}`;
};

export const logger = {
  info(message, meta) {
    console.log(`[research-agent] ${message}${formatMeta(meta)}`);
  },

  warn(message, meta) {
    console.warn(`[research-agent] ${message}${formatMeta(meta)}`);
  },

  error(message, meta) {
    console.error(`[research-agent] ${message}${formatMeta(meta)}`);
  }
};
