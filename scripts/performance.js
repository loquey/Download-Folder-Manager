
class PerfMonitor {
    static monitor(name, times, func, thisContext,  ...args) {

        var t0 = performance.now();

        for (let index = 0; index < times; index++) {
            var result = func.apply(thisContext, args);
        }

        var t1 = performance.now();

        console.log("Call to " + name +" executed x" + times + " took " + (t1 - t0) + " milliseconds.");
        console.log("Call to " + name +" execution to average of " + ((t1 - t0)/times) + " milliseconds.");

        return result;
    }
}