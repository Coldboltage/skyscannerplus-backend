import "reflect-metadata"
import { DataSource } from "typeorm"
import { UserFlightTypeORM, ScanDateORM, DepartureDate, ReturnDatesORM, Dates } from "./entity/user-flight.entity"
import { User } from "./entity/user.entity"

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: 'postgres',
    synchronize: true,
    logging: false,
    entities: [UserFlightTypeORM, ScanDateORM, DepartureDate, ReturnDatesORM, User, Dates],
    migrations: [],
    subscribers: [],
})
