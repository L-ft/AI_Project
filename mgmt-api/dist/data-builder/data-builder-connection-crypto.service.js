"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBuilderConnectionCryptoService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let DataBuilderConnectionCryptoService = class DataBuilderConnectionCryptoService {
    buildSnapshot(mysql) {
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
    restoreConnection(snapshot, encrypted) {
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
    encryptSecretPayload(payload) {
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
    decryptSecretPayload(payload) {
        const secret = this.resolveSecret();
        const key = crypto.createHash('sha256').update(secret).digest();
        const iv = Buffer.from(String(payload.iv ?? ''), 'base64');
        const tag = Buffer.from(String(payload.tag ?? ''), 'base64');
        const ciphertext = Buffer.from(String(payload.ciphertext ?? ''), 'base64');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return JSON.parse(plain.toString('utf8'));
    }
    resolveSecret() {
        return (process.env.DATA_BUILDER_CONN_ENCRYPTION_KEY ||
            process.env.JWT_SECRET ||
            'ai_platform_secret');
    }
    asPort(value) {
        const n = Number(value);
        return Number.isFinite(n) && n > 0 ? n : 3306;
    }
};
exports.DataBuilderConnectionCryptoService = DataBuilderConnectionCryptoService;
exports.DataBuilderConnectionCryptoService = DataBuilderConnectionCryptoService = __decorate([
    (0, common_1.Injectable)()
], DataBuilderConnectionCryptoService);
//# sourceMappingURL=data-builder-connection-crypto.service.js.map