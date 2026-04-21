export type DataBuilderTaskMode = 'proxy' | 'shadow' | 'db_primary';
export declare function getDataBuilderTaskMode(): DataBuilderTaskMode;
export declare function isDataBuilderShadowEnabled(): boolean;
export declare function isDataBuilderDbPrimaryEnabled(): boolean;
export declare function isDataBuilderLegacyFallbackMode(): boolean;
export declare function isDataBuilderPersistenceEnabled(): boolean;
export declare function shouldDataBuilderShadowReadThrough(): boolean;
