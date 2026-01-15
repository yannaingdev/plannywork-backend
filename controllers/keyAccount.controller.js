import mongoose from "mongoose";
import KeyAccount from "../model/KeyAccount.js";
import { BadRequestError } from "../errors/ErrorIndex.js";
import getUserSession from "../utils/getUserSession.js";

const parseCoordinate = (value, label) => {
  const parsed =
    typeof value === "string" && value.trim().length > 0
      ? Number(value)
      : value;
  if (parsed === undefined || parsed === null || Number.isNaN(parsed)) {
    throw new BadRequestError(`${label} is required and must be a number`);
  }
  return parsed;
};

const buildGeoPoint = (lat, lng) => {
  const parsedLat = parseCoordinate(lat, "lat");
  const parsedLng = parseCoordinate(lng, "lng");
  if (parsedLat < -90 || parsedLat > 90) {
    throw new BadRequestError("lat must be between -90 and 90");
  }
  if (parsedLng < -180 || parsedLng > 180) {
    throw new BadRequestError("lng must be between -180 and 180");
  }
  return { type: "Point", coordinates: [parsedLng, parsedLat] };
};

const requireUserId = async (req) => {
  try {
    return await getUserSession(req);
  } catch (error) {
    const unauthorizedError = new Error("User is not authenticated");
    unauthorizedError.statusCode = 401;
    throw unauthorizedError;
  }
};

const shapeKeyAccount = (doc) => {
  const serialized = doc.toJSON();
  if (
    serialized.lat === undefined ||
    serialized.lng === undefined ||
    serialized.location === undefined
  ) {
    const coords = doc.location?.coordinates;
    if (Array.isArray(coords) && coords.length === 2) {
      serialized.lng = coords[0];
      serialized.lat = coords[1];
    }
  }
  return serialized;
};

const buildGeoFilter = (lat, lng, radiusMeters) => {
  if (
    lat === undefined &&
    lng === undefined &&
    (radiusMeters === undefined || radiusMeters === "")
  ) {
    return null;
  }
  if (lat === undefined || lng === undefined) {
    throw new BadRequestError("lat and lng are required when filtering by distance");
  }
  const distance =
    radiusMeters === undefined || radiusMeters === ""
      ? 5000
      : Number(radiusMeters);
  if (Number.isNaN(distance) || distance <= 0) {
    throw new BadRequestError("radius must be a positive number (meters)");
  }
  return {
    $near: {
      $geometry: buildGeoPoint(lat, lng),
      $maxDistance: distance,
    },
  };
};

export const createKeyAccount = async (req, res, next) => {
  const { name, address, description, externalId, lat, lng } = req.body;
  if (!name) {
    return next(new BadRequestError("name is required"));
  }
  let userId;
  try {
    userId = await requireUserId(req);
  } catch (error) {
    return next(error);
  }
  let location;
  try {
    location = buildGeoPoint(lat, lng);
  } catch (error) {
    return next(error);
  }
  const payload = {
    name: name.trim(),
    address,
    description,
    externalId,
    location,
    createdBy: userId,
  };
  try {
    const keyAccount = await KeyAccount.create(payload);
    res.status(201).json({ keyAccount: shapeKeyAccount(keyAccount) });
  } catch (error) {
    next(error);
  }
};

export const listKeyAccounts = async (req, res, next) => {
  const { search, page = 1, limit = 20, lat, lng, radius, mine } = req.query;
  let userId;
  try {
    userId = await requireUserId(req);
  } catch (error) {
    return next(error);
  }
  const query = {};
  const mineFlag = String(mine).toLowerCase();
  if (mineFlag === "true" || mineFlag === "1") {
    query.createdBy = userId;
  }
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  try {
    const geoFilter = buildGeoFilter(lat, lng, radius);
    if (geoFilter) {
      query.location = geoFilter;
    }
  } catch (error) {
    return next(error);
  }
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;
  try {
    const keyAccounts = await KeyAccount.find(query)
      .sort("-updatedAt")
      .skip(skip)
      .limit(limitNumber);
    const total = await KeyAccount.countDocuments(query);
    res.status(200).json({
      keyAccounts: keyAccounts.map(shapeKeyAccount),
      total,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error) {
    next(error);
  }
};

export const getKeyAccountById = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid key account id"));
  }
  let userId;
  try {
    userId = await requireUserId(req);
  } catch (error) {
    return next(error);
  }
  try {
    const keyAccount = await KeyAccount.findOne({ _id: id, createdBy: userId });
    if (!keyAccount) {
      const notFoundError = new Error("Key account not found");
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    res.status(200).json({ keyAccount: shapeKeyAccount(keyAccount) });
  } catch (error) {
    next(error);
  }
};
