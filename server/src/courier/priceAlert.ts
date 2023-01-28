import { CourierClient } from "@trycourier/courier";
import { UserFlightTypeORM } from "../entity/user-flight.entity";

const courier = CourierClient({
  authorizationToken: process.env.COURIER_TOKEN,
});

const priceAlert = async (
  userFlight: UserFlightTypeORM
) => {
  const { requestId } = await courier.send({
    message: {
      to: {
        email: "alandreid@hotmail.co.uk",
        discord: {
          user_id: "135427259396784128",
        },
      },
      template: "KD0DN369484HSMGBX0G3PGQX59XP",
      data: {
        alert: userFlight.alertPrice,
        reference: userFlight.ref,
        depart: userFlight.flights.departure,
        arrival: userFlight.flights.arrival,
      },
    },
  });
  console.log("I was fired");
  console.log(requestId);
};

export default priceAlert;
