const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  user: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  ref: {
    type: String,
    required: true,
  },
  isBeingScanned: {
    type: Boolean,
    required: true,
  },
  workerPID: {
    type: Number,
    required: true,
  },
  scannedLast: {
    type: Number,
    required: true,
  },
  nextScan: {
    type: Number,
    required: true,
  },
  flights: {
    departure: {
      type: String,
      required: true,
    },
    arrival: {
      type: String,
      required: true,
    },
  },
  dates: {
    departureDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    minimalHoliday: {
      type: Number,
      required: true,
    },
    maximumHoliday: {
      type: Number,
      required: true,
    },
  },
  scanDate: [
    {
      // This let's us know when the scan was done
      dateOfScanLoop: {
        type: String,
        required: true,
      },
      departureDate: [
        {
          date: {
            type: Date,
            required: true,
          },
          dateString: {
            type: String,
            required: true,
          },
          returnDates: [
            {
              departDate: {
                type: Date,
                required: true,
              },
              returnDate: {
                type: Date,
                required: true,
              },
              daysBetweenDepartureDateAndArrivalDate: {
                type: Number,
                required: true,
              },
              dateString: {
                type: String,
                required: true,
              },
              url: {
                type: String,
                required: true,
              },
              cheapest: {
                cost: {
                  type: Number,
                  required: true,
                },
                time: {
                  type: String,
                },
                arrival: {
                  type: String,
                },
                durationOfFlight: {
                  type: String,
                },
              },
              best: {
                cost: {
                  type: Number,
                  required: true,
                },
                time: {
                  type: String,
                },
                arrival: {
                  type: String,
                },
                durationOfFlight: {
                  type: String,
                },
              },
            },
          ],
        },
      ],
    },
  ],
});

module.exports = mongoose.model("userflight", flightSchema);
