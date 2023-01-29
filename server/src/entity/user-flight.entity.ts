import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  ValueTransformer
} from 'typeorm';
import { User } from './user.entity';

export const bigint: ValueTransformer = {
  to: (entityValue: number) => entityValue.toString(),
  from: (databaseValue: string): number => parseInt(databaseValue, 10)
};

export class Currency {
  fullCurrency: string;
  currencyCode: string;
}

export class Flights {
  departure: string;
  arrival: string;
  returnFlight: boolean;
  passengers?: number;
}

export class Cheapest {
  cost: number;
  costWithCurrency: string;
  time: string;
  arrival: string;
  durationOfFlight: string;
}
export class Best {
  cost: number;
  costWithCurrency: string;
  time: string;
  arrival: string;
  durationOfFlight: string;
}

@Entity()
export class Dates {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column()
  departureDate: Date;
  @Column()
  returnDate: Date;
  @Column({ nullable: true })
  departureDateString?: string;
  @Column({ nullable: true })
  returnDateString?: string;
  @Column()
  minimalHoliday: number;
  @Column()
  maximumHoliday: number;
  @Column({ nullable: true })
  requiredDayStart?: Date;
  @Column({ nullable: true })
  requiredDayEnd?: Date;
  @Column({ nullable: true })
  weekendOnly?: Date;

  // userFlight: any;
}

@Entity()
export class UserFlightTypeORM {
  save() {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column()
  created: Date;
  @ManyToOne(() => User)
  user: User;
  @Column()
  ref: string;
  @Column({nullable: false})
  isBeingScanned: boolean;
  @Column()
  workerPID: number;
  @Column({ type: 'bigint', default: 0 })
  lastUpdated: number;
  @Column({ type: 'bigint', default: 0 })
  scannedLast: number;
  @Column()
  nextScan: Date;
  @Column({ nullable: true })
  screenshot?: string;
  @Column()
  status: string;
  @Column('simple-json')
  currency: {
    fullCurrency: string;
    currencyCode: string;
  };
  @Column({ nullable: true })
  alertPrice?: number;
  @Column({ nullable: true })
  alertPriceFired: boolean;
  @Column('simple-json')
  flights: {
    departure: string;
    arrival: string;
    returnFlight: boolean;
    passengers?: number;
  };
  @OneToOne(() => Dates, {eager: true})
  @JoinColumn()
  dates: Dates;
  @OneToMany(() => ScanDateORM, (scanDate) => scanDate.userFlight, {
    eager: true,
  })
  scanDate?: ScanDateORM[];
}

@Entity()
export class ScanDateORM {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column({ type: 'timestamp' })
  dateOfScanLoop: Date;
  @ManyToOne(() => UserFlightTypeORM)
  userFlight: UserFlightTypeORM;
  @OneToMany(() => DepartureDate, (departureDate) => departureDate.scanDate, {
    eager: true,
  })
  departureDate?: DepartureDate[];
  length: number;
}

@Entity()
export class DepartureDate {
  length(length: any) {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column()
  dateString: string;
  @ManyToOne(() => ScanDateORM)
  scanDate: ScanDateORM;
  @OneToMany(
    () => ReturnDatesORM,
    (returnDates) => returnDates.departureDates,
    {
      eager: true,
    },
  )
  returnDates?: ReturnDatesORM[];
}

@Entity()
export class ReturnDatesORM {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @ManyToOne(() => DepartureDate)
  departureDates: DepartureDate;
  @Column()
  departDate: Date;
  @Column()
  returnDate: Date;
  @Column()
  daysBetweenDepartureDateAndArrivalDate: number;
  @Column()
  dateString: string;
  @Column()
  url: string;
  @Column('simple-json')
  flightDatesString: {
    departDate: string;
    returnDate: string;
  };
  @Column('simple-json')
  cheapest: {
    cost: number;
    costWithCurrency: string;
    time: string;
    arrival: string;
    durationOfFlight: string;
  };
  @Column('simple-json')
  best: {
    cost: number;
    costWithCurrency: string;
    time: string;
    arrival: string;
    durationOfFlight: string;
  };
}
