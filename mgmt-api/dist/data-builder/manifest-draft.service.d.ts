export interface MysqlConnDraft {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare class ManifestDraftService {
    fromPrompt(prompt: string, mysql: MysqlConnDraft, tableHint?: string): Record<string, unknown>;
}
