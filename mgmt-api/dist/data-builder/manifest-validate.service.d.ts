export interface ManifestValidationFailure {
    code: string;
    message: string;
    fixes: string[];
    errors: Array<{
        path: string;
        keyword: string;
        message: string;
    }>;
}
export declare class ManifestValidateService {
    private readonly validate;
    constructor();
    private resolveSchemaPath;
    assertValidManifest(manifest: unknown): void;
    private toHttpBody;
    private schemaFixes;
}
