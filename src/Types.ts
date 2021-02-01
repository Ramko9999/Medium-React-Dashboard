
export type Day = {
    day_id: string,
    views: number,
    reads: number,
    viewers: number
}

export type UsageData = {
    days: Day[],
    views: number,
    reads: number,
    viewers: number
}

