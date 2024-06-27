// src/config/configuration.ts
import * as dotenv from 'dotenv';

export class ConfigService {
  constructor() {
    const env = process.env.NODE_ENV || 'development';
    const envFilePath = `.${env}.env`;

    dotenv.config({ path: envFilePath });
  }

  get(key: string): string {
    return process.env[key];
  }
}
