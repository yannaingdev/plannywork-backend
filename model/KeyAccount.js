import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length === 2 &&
          value.every(
            (coord) => typeof coord === "number" && !Number.isNaN(coord)
          ),
        message: "coordinates must be an array [lng, lat]",
      },
    },
  },
  { _id: false }
);

const keyAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

keyAccountSchema.index({ location: "2dsphere" });

keyAccountSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    const coordinates = ret.location?.coordinates;
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      ret.lng = coordinates[0];
      ret.lat = coordinates[1];
    }
    return ret;
  },
});

export default mongoose.model("KeyAccount", keyAccountSchema);
