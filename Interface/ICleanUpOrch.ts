export type RunDate = {
    error?: boolean
    message?: string
    from?: string
    to?: string
}


export type CleanUpOrchInput = {
    from: string;
    to: string;
    failed: boolean;
};

