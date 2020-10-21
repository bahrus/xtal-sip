export type PreemptiveLoadingArgumentJS = [linkTagId: string | undefined, dynamicImport: Function | ImportAsserts| undefined, CDNFallback: string | undefined];
export type PreemptiveLoadingArgumentWithAsserts = [linkTagId: string | undefined, dynamicImport: Function | ImportAsserts| undefined, CDNFallback: string | undefined, asserts: ImportAsserts];
export type PreemptiveLoadingArgument = PreemptiveLoadingArgumentJS | PreemptiveLoadingArgumentWithAsserts;

export interface IContext {
    tagName: string;
}

export interface ImportAsserts {
    type: 'css',
    cssScope: 'global' | 'shadow'
}

export interface IDynamicImportArg {
    asserts: ImportAsserts,
    localName: string
}

export type DynamicImportType = (importArg: IDynamicImportArg) => void;

export type PathFromContext = (ctx: IContext) => string;

export type LinkTagRef = [linkTagId: string | undefined];
export type LinkTagDynamicImport = [linkTagId: string | undefined, dynamicImport: Function | undefined];
export type LinkTagDynamicImportCDN = [linkTagId: string | undefined, dynamicImport: Function | undefined, CDNFallback:  string | PathFromContext | undefined];
export type AssertsLinkTagRef = [asserts: ImportAsserts, linkTagId: string | undefined];
export type AssertsDynamicImport = [asserts: ImportAsserts, linkTagId: string | undefined, dynamicImport: DynamicImportType | undefined];
export type AssertsDynamicImportCDN = [asserts: ImportAsserts, linkTagId: string | undefined, dynamicImport: DynamicImportType | undefined, CDNFallback: string | PathFromContext | undefined];

export type ConditionalLoadingTuple = LinkTagRef | LinkTagDynamicImport | LinkTagDynamicImportCDN | AssertsLinkTagRef | AssertsDynamicImport | AssertsDynamicImportCDN ;

export type ConditionalLoadingLookup = {[tagName: string]: ConditionalLoadingTuple[]};