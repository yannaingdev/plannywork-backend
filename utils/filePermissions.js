export function canReadFile(user, file) {
  if (file.visility === "public") return true;
  if (file.ownerId.equals(user.id)) return true;
  if (user.role === "admin") return true;
  return false;
}
export function canDeleteFile(user, file) {
  if (file.ownerId.equals(user.id)) return true;
  if (user.role === "admin") return true;
  return false;
}
