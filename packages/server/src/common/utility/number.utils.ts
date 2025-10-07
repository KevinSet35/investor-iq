export class NumberUtils {

    static roundToTwo(value: number): number {
        return Math.round(value * 100) / 100;
    }

}
