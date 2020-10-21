export type PreemptiveLoadingArgumentJS = [linkTagId: string | undefined, dynamicImport: Function | ImportOptions| undefined, CDNFallback: string | undefined];
export type PreemptiveLoadingArgumentWithAsserts = [linkTagId: string | undefined, dynamicImport: Function | ImportOptions| undefined, CDNFallback: string | undefined, options: ImportOptions];
export type PreemptiveLoadingArgument = PreemptiveLoadingArgumentJS | PreemptiveLoadingArgumentWithAsserts;

export interface IContext {
    tagName: string;
}

export interface ImportOptions {
    cssScope: 'global' | 'shadow'
}

export interface IDynamicImportArg {
    options: ImportOptions,
    localName: string
}

export type DynamicImportType = (importArg: IDynamicImportArg) => void;

export type PathFromContext = (ctx: IContext) => string;

export type LinkTagRef = [linkTagId: string | undefined];
export type LinkTagDynamicImport = [linkTagId: string | undefined, dynamicImport: Function | undefined];
export type LinkTagDynamicImportCDN = [linkTagId: string | undefined, dynamicImport: Function | undefined, CDNFallback:  string | PathFromContext | undefined];
export type LinkTagDynamicImportCDNOptions = [linkTagId: string | undefined, dynamicImport: Function | undefined, CDNFallback:  string | PathFromContext | undefined, options: ImportOptions | undefined];

export type ConditionalLoadingTuple = LinkTagRef | LinkTagDynamicImport | LinkTagDynamicImportCDN | LinkTagDynamicImportCDNOptions ;

export type ConditionalLoadingLookup = {[tagName: string]: ConditionalLoadingTuple[]};