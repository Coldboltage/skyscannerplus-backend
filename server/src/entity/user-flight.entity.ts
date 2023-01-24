import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

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

export class Dates {
  departureDate: Date;
  returnDate: Date;
  departureDateString?: string;
  returnDateString?: string;
  minimalHoliday: number;
  maximumHoliday: number;
  requiredDayStart?: Date;
  requiredDayEnd?: Date;
  weekendOnly?: Date;
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
export class UserFlightTypeORM {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column()
  created: Date;
  @ManyToOne(() => User)
  user: User;
  @Column()
  ref: string;
  @Column()
  isBeingScanned: boolean;
  @Column()
  workerPID: number;
  @Column({ type: 'bigint', default: 0 })
  lastUpdated: number;
  @Column({ type: 'bigint', default: 0 })
  scannedLast: number;
  @Column({ type: 'bigint', default: 0 })
  nextScan: number;
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
  @Column('simple-json')
  flights: {
    departure: string;
    arrival: string;
    returnFlight: boolean;
    passengers?: number;
  };
  @Column('simple-json')
  dates: {
    departureDate: Date;
    returnDate: Date;
    departureDateString?: string;
    returnDateString?: string;
    minimalHoliday: number;
    maximumHoliday: number;
    requiredDayStart?: Date;
    requiredDayEnd?: Date;
    weekendOnly?: Date;
  };
  @OneToMany(() => ScanDateORM, (scanDate) => scanDate.userFlight, {
    eager: true,
  })
  scanDate?: ScanDateORM[];
}

@Entity()
export class ScanDateORM {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column({ type: 'date' })
  dateOfScanLoop: Date;
  @ManyToOne(() => UserFlightTypeORM)
  userFlight: UserFlightTypeORM;
  @OneToMany(() => DepartureDate, (departureDate) => departureDate.scanDate, {
    eager: true,
  })
  departureDate?: DepartureDate[];
}

@Entity()
export class DepartureDate {
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
