import { z } from 'zod';

export const defineCollection = (config: any) => {
  return {
    ...config,
    _mocked_via_alias: true 
  };
};

export { z };
