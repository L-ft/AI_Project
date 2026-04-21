import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import type { MysqlConnDraft } from './manifest-draft.service';

@Injectable()
export class DataBuilderConnectionCryptoService {
  buildSnapshot(mysql: MysqlConnDraft): {
    snapshot: Record<string, unknown>;
    encrypted: Record<string, unknown>;
  } {
    const snapshot = {
      host: mysql.host,
      port: mysql.port,
      user: mysql.user,
      database: mysql.database,
    };
    return {
      snapshot,
      encrypted: this.encryptSecretPayload({ password: mysql.password ?? '' }),
    };
  }

  restoreConnection(
    snapshot: Record<string, unknown> | null | undefined,
    encrypted: Record<string, unknown> | null | undefined,
  ): MysqlConnDraft | null {
    if (!snapshot || typeof snapshot !== 'object' || !encrypted || typeof encrypted !== 'object') {
      return null;
    }
    const secretPayload = this.decryptSecretPayload(encrypted);
    return {
      host: String(snapshot.host ?? '').trim(),
      port: this.asPort(snapshot.port),
      user: String(snapshot.user ?? '').trim(),
      password: String(secretPayload.password ?? ''),
      database: String(snapshot.database ?? '').trim(),
    };
  }

  private encryptSecretPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const secret = this.resolveSecret();
    const key = crypto.createHash('sha256').update(secret).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const raw = Buffer.from(JSON.stringify(payload), 'utf8');
    const ciphertext = Buffer.concat([cipher.update(raw), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      alg: 'AES-256-GCM',
      kid: process.env.DATA_BUILDER_CONN_ENCRYPTION_KID || 'data-builder-local-v1',
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  }

  private decryptSecretPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const secret = this.resolveSecret();
    const key = crypto.createHash('sha256').update(secret).digest();
    const iv = Buffer.from(String(payload.iv ?? ''), 'base64');
    const tag = Buffer.from(String(payload.tag ?? ''), 'base64');
    const ciphertext = Buffer.from(String(payload.ciphertext ?? ''), 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(plain.toString('utf8')) as Record<string, unknown>;
  }

  private resolveSecret(): string {
    return (
      process.env.DATA_BUILDER_CONN_ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      'ai_platform_secret'
    );
  }

  private asPort(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 3306;
  }
}
