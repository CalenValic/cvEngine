export const clock: {
    timers: Set<string>,
    addTimer: (name: string, delay: number) => void
} = {
    timers: new Set(),
    addTimer: (name: string, delay: number) => {
        clock.timers.add(name)
        setTimeout(() => {
            clock.timers.delete(name)
        }, delay * 1000)
    }
}