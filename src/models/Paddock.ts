import { PaddockCar, PaddockDriver, PaddockGame, PaddockTrack } from '../services/types';

abstract class PaddockEntity {
    constructor(
        readonly id: number,
        readonly name?: string
    ) {}
}

export class Car extends PaddockEntity implements PaddockCar {}
export class Driver extends PaddockEntity implements PaddockDriver {}
export class Game extends PaddockEntity implements PaddockGame {}
export class Track extends PaddockEntity implements PaddockTrack {}

export class SessionType extends PaddockEntity implements PaddockSessionType {
    constructor(
        id: number,
        readonly type?: string
    ) {
        super(id, type);
    }
}
