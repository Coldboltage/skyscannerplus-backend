import "reflect-metadata"
import { DataSource } from "typeorm"
import { UserFlightTypeORM, ScanDateORM, DepartureDate, ReturnDatesORM, Dates } from "./entity/user-flight.entity"
import { User } from "./entity/user.entity"
import { ProxyIP } from "./entity/proxy.entity"

// export const AppDataSource = new DataSource({
//     type: 'postgres',
//     // host: 'host.docker.internal',
//     host: 'localhost',
//     port: 5432,
//     username: 'postgres',
//     password: process.env.POSTGRES_PASSWORD,
//     database: 'postgres',
//     synchronize: true,
//     logging: false,
//     entities: [UserFlightTypeORM, ScanDateORM, DepartureDate, ReturnDatesORM, User, Dates],
//     migrations: [],
//     subscribers: [],
// })

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DEVELOPMENT === "true" ? 'localhost' : 'host.docker.internal',
    // host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: 'postgres',
    synchronize: true,
    logging: false,
    entities: [UserFlightTypeORM, ScanDateORM, DepartureDate, ReturnDatesORM, User, Dates, ProxyIP],
    migrations: [],
    subscribers: [],
})
