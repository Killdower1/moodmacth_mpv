export function genOtp6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
export function inMinutes(min: number) {
  return new Date(Date.now() + min * 60_000);
}
// Dev stub pengiriman OTP (ganti ke Twilio/WA Cloud API saat production)
export async function sendOtpDevLog(phone: string | null, code: string, channel: "sms" | "wa") {
  console.log(`[DEV][OTP] to=${phone ?? "(no-phone)"} channel=${channel} code=${code}`);
}