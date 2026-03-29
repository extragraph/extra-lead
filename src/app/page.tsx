import { AuditDashboard } from "@/components/dashboard/audit-dashboard";
import { isGooglePageSpeedConfigured } from "@/lib/env/google-api-keys";

export default function Home() {
  return <AuditDashboard hasPageSpeedKey={isGooglePageSpeedConfigured()} />;
}
