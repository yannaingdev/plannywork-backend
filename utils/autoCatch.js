export default function autoCatch(handlers) {
  return Object.keys(handlers).reduce((autoHandlers, currKey) => {
    const handler = handlers[currKey];
    autoHandlers[currKey] = (req, res, next) =>
      Promise.resolve(handler(req, res, next)).catch(next);
    return autoHandlers;
  }, {});
}
