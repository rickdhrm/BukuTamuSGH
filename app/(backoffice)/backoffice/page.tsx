import { BackofficeAuthGuard } from "@/components/backoffice/backoffice-auth-guard";
import { BackofficeDashboard } from "@/components/backoffice/backoffice-dashboard";

export default function BackofficeDashboardPage() {
  return (
    <BackofficeAuthGuard>
      <BackofficeDashboard />
    </BackofficeAuthGuard>
  );
}
