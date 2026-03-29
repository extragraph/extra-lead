import { AuditDashboard } from "@/components/dashboard/audit-dashboard";

export default function Home() {
  const hasPageSpeedKey = Boolean(process.env.GOOGLE_PAGESPEED_API_KEY?.trim());
  return <AuditDashboard hasPageSpeedKey={hasPageSpeedKey} />;
}
