import * as calibrationData from '../calibration.json';
import { injectable } from 'inversify';

class Point {
    constructor(public x: number, public y: number) {
        if (x === undefined
            || x === null
            || y === undefined
            || y === null) {
            throw new Error('Empty values are not expected');
        }
    }
}

class LinearInterpolator {

    private sPoints: Point[]

    constructor(points: Point[]) {
        this.sPoints = points.sort((a, b) => {
            if (a.x < b.x) {
                return -1;
            } else if (a.x > b.x) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    public interpolate(x: number) {
        if (x <= this.sPoints[0].x) {
            return this.sPoints[0].y;
        }

        for (let i = 0; i <= this.sPoints.length - 2; i++) {
            const a = this.sPoints[i];
            const b = this.sPoints[i + 1];

            if (a.x === x) {
                return a.y;
            } else if (b.x === x) {
                return b.y;
            } else if (a.x !== b.x && a.x <= x && b.x >= x) {
                return this.linearInterpolationFunc(x, a, b);
            }
        }

        return this.sPoints[this.sPoints.length - 1].y;
    }

    private linearInterpolationFunc(x: number, a: Point, b: Point) {
        return a.y + (x - a.x) * (b.y - a.y) / (b.x - a.x);
    }
}

@injectable()
export class PressureInterpolatorService {
    private interpolator: LinearInterpolator;

    constructor() {
        const pressureData: Array<Array<number>> = (<any>calibrationData).pressure;
        const points: Point[] = [];
        for (const vector of pressureData) {
            points.push(new Point(Number(vector[0]), Number(vector[1])));
        }

        this.interpolator = new LinearInterpolator(points);
    }

    public getPressure(volts: number) {
        return this.interpolator.interpolate(volts);
    }
}