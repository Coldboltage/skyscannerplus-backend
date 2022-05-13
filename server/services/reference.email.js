const { CourierClient } = require("@trycourier/courier");

const courier = CourierClient({
  authorizationToken: "pk_prod_N7748T5Y1A4N1QNVVPZAEB78Z5M5",
});

const testEmail = async (
  cheapestFlightsOrderMax,
  bestFlightsOrderMax,
  userFlight
) => {
  const { requestId } = await courier.send({
    message: {
      to: {
        email: userFlight.user.email,
      },
      template: "AHNVWAJMJ7413SHMFTHXTFPJ5HSY",
      data: {
        name: userFlight.user.name,
        reference: userFlight.ref,
        cheapestFlight: cheapestFlightsOrderMax,
        bestFlight: bestFlightsOrderMax
      },
    },
  });
  console.log("I was fired");
  console.log(requestId);
};

module.exports = testEmail;
