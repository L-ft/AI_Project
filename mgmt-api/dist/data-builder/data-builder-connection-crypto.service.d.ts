import type { MysqlConnDraft } from './manifest-draft.service';
export declare class DataBuilderConnectionCryptoService {
    buildSnapshot(mysql: MysqlConnDraft): {
        snapshot: Record<string, unknown>;
        encrypted: Record<string, unknown>;
    };
    restoreConnection(snapshot: Record<string, unknown> | null | undefined, encrypted: Record<string, unknown> | null | undefined): MysqlConnDraft | null;
    private encryptSecretPayload;
    private decryptSecretPayload;
    private resolveSecret;
    private asPort;
}
