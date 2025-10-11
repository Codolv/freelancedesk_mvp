// lib/roles.ts
export function isClient(profile: any) {
  return profile?.role === "client";
}
export function isFreelancer(profile: any) {
  return profile?.role === "freelancer";
}
