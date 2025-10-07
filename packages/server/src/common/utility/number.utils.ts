export class NumberUtils {

    static roundToTwo(value: number): number {
        return Math.round(value * 100) / 100;
    }

    static isValidPercentage(value: number): boolean {
        return value >= 0 && value <= 100;
    }

}
