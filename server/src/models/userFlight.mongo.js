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
  lastUpdated: {
    type: Number,
  },
  scannedLast: {
    type: Number,
    required: true,
  },
  nextScan: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
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
    passengers: {
      type: Number,
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
    departureDateString: {
      type: String,
    },
    returnDateString: {
      type: String,
    },
    minimalHoliday: {
      type: Number,
      required: true,
    },
    maximumHoliday: {
      type: Number,
      required: true,
    },
    requiredDayStart: {
      type: Date,
    },
    requiredDayEnd: {
      type: Date,
    },
    weekendOnly: {
      type: Boolean,
    }
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
              flightDatesString : {
                type: Object,
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
