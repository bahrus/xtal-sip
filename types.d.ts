export type PreemptiveLoadingArgumentJS = [
    linkTagId: string | DynamicImportType | undefined, 
    dynamicImport: DynamicImportType | undefined, 
    CDNFallback: DynamicImportType | string | undefined, 
    ctx: IContext | undefined
];
export type PreemptiveLoadingArgumentWithAsserts = [
    linkTagId: string | DynamicImportType | undefined, 
    dynamicImport: DynamicImportType | undefined, 
    CDNFallback: DynamicImportType | string | undefined, 
    ctx: IContext | undefined, 
    options: ImportOptions
];
export type PreemptiveLoadingArgument = PreemptiveLoadingArgumentJS | PreemptiveLoadingArgumentWithAsserts;

export interface IContext {
    localName?: string;
    previousLoadingArgument?: PreemptiveLoadingArgument;
    host?: HTMLElement | DocumentFragment;
    importOptions?: ImportOptions;
    path?: string;
}

export interface ImportOptions extends IContext {
    cssScope?: 'global' | 'shadow' | 'na',
    
}

// export interface IDynamicImportArg {
//     options: ImportOptions,
//     localName: string
// }

export type DynamicImportType = (context: IContext) => string;

export type PathFromContext = (ctx: IContext) => string;

export type LinkTagRef = [linkTagId: string | undefined];
export type LinkTagDynamicImport = [linkTagId: string | undefined, dynamicImport: Function | undefined];
export type LinkTagDynamicImportCDN = [linkTagId: string | undefined, dynamicImport: Function | undefined, CDNFallback:  string | PathFromContext | undefined];
export type LinkTagDynamicImportCDNOptions = [linkTagId: string | undefined, dynamicImport: Function | undefined, CDNFallback:  string | PathFromContext | undefined, options: ImportOptions | undefined];

export type ConditionalLoadingTuple = LinkTagRef | LinkTagDynamicImport | LinkTagDynamicImportCDN | LinkTagDynamicImportCDNOptions ;

export type ConditionalLoadingLookup = {[tagName: string]: ConditionalLoadingTuple[]};