import { requireAuth } from "@/lib/auth-utils";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-neutral-950 text-neutral-100">
        <AppSidebar user={session.user} />
        <SidebarInset className="flex flex-1 flex-col bg-neutral-950">
          {/* Top Header Bar */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-800/80 px-4">
            <SidebarTrigger className="-ml-1 text-neutral-400 hover:text-white" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-neutral-800" />
            <div className="flex flex-1 items-center justify-between">
              <span className="text-xs text-neutral-400 font-mono">
                Workspace / <span className="text-neutral-200">Personal</span>
              </span>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
