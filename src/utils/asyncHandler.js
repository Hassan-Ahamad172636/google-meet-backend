// Yeh wrapper function async controllers ke errors ko catch karta hai
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
  