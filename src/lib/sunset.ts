// Sunset from the standard solar-position approximation (the same maths SunCalc uses).
// Accurate to about a minute, which is plenty for a porch light.

const RAD = Math.PI / 180;
const OBLIQUITY = RAD * 23.4397;
const J1970 = 2440588;
const J2000 = 2451545;
const J0 = 0.0009;

// Downtown Sacramento, deliberately not the house.
export const SACRAMENTO = { lat: 38.5816, lng: -121.4944 } as const;
export const PORCH_LEAD_MINUTES = 20;

export function sunset(date: Date, lat: number, lng: number): Date {
  const days = date.valueOf() / 864e5 - 0.5 + J1970 - J2000;
  const lw = RAD * -lng;
  const phi = RAD * lat;
  const n = Math.round(days - J0 - lw / (2 * Math.PI));
  const ds = J0 + lw / (2 * Math.PI) + n;
  const M = RAD * (357.5291 + 0.98560028 * ds);
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + RAD * 102.9372 + Math.PI;
  const dec = Math.asin(Math.sin(OBLIQUITY) * Math.sin(L));
  const w = Math.acos(
    (Math.sin(-0.833 * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)),
  );
  const a = J0 + (w + lw) / (2 * Math.PI) + n;
  const julianSet = J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  return new Date((julianSet + 0.5 - J1970) * 864e5);
}

/** When the porch light switches on: sunset in Sacramento minus the lead time. */
export function porchLightOn(date = new Date()): Date {
  const set = sunset(date, SACRAMENTO.lat, SACRAMENTO.lng);
  return new Date(set.getTime() - PORCH_LEAD_MINUTES * 60_000);
}

export function formatPacific(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });
}
