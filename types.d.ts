export type PreemptiveLoadingArgument = [linkTagId: string | undefined, dynamicImport: Function | undefined, CDNFallback: string | undefined];

export interface IContext {
    tagName: string;
}

export type PathFromContext = (ctx: IContext) => string;

export type ConditionalLoadingTuple = [linkTagId: string | undefined, dynamicImport: Function | undefined, CDNFallback:  string | PathFromContext | undefined];

export type ConditionalLoadingLookup = {[tagName: string]: ConditionalLoadingTuple[]};