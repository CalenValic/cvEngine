export const clock = {
    timers: new Set(),
    addTimer: (name, delay) => {
        clock.timers.add(name);
        setTimeout(() => {
            clock.timers.delete(name);
        }, delay * 1000);
    }
};
