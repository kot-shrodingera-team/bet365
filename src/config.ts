let config: string;

export const setConfig = (newConfig: string): void => {
  config = newConfig;
};

export const getConfig = (): string => config;
