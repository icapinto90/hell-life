export function getGroundYAtX(contour, x) {
  const point = contour.find((p) => p.x === Math.round(x));
  console.log("point", point);
  return point ? point.y : null;
}
