export type PreemptiveLoadingArgument = [linkTagId: string | undefined, dynamicImport: Function | ImportOptions| undefined, CDNFallback: string | undefined];

export interface IContext {
    tagName: string;
}

export interface ImportOptions {
    type: 'css',
    cssScope: 'global'
}

export type PathFromContext = (ctx: IContext) => string;

export type LinkTagRef = [linkTagId: string | undefined];
export type LinkTagDynamicImport = [linkTagId: string | undefined, dynamicImport: Function | undefined];
export type LinkTagDynamicImportCDN = [linkTagId: string | undefined, dynamicImport: Function | undefined, CDNFallback:  string | PathFromContext | undefined]

export type ConditionalLoadingTuple = LinkTagRef | LinkTagDynamicImport | LinkTagDynamicImportCDN ;

export type ConditionalLoadingLookup = {[tagName: string]: ConditionalLoadingTuple[]};