"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mic,
  BedDouble,
  ChevronDown,
  Activity,
  Users,
  Plus,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
} from "lucide-react";
import { getPatients } from "@/lib/supabase/patients";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import type { Patient } from "@/types/database";

const navItems = [
  { href: "/", label: "Dashboard", sublabel: "Visao geral da UTI", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", sublabel: "Gestao de leitos", icon: Users },
  { href: "/audio", label: "Novo Audio", sublabel: "Laudo por voz com IA", icon: Mic },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [patientsOpen, setPatientsOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    getPatients().then(setPatients).catch(() => {});
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0 relative",
        collapsed ? "w-[68px]" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 glow-teal">
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm font-bold text-sidebar-foreground tracking-tight">UTI Manager</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.15em]">HUSE &bull; Sergipe</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[52px] w-6 h-6 bg-secondary border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors z-10"
      >
        {collapsed ? (
          <PanelLeft className="w-3 h-3 text-muted-foreground" />
        ) : (
          <PanelLeftClose className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {!collapsed && (
        <nav className="flex-1 overflow-auto py-4 px-3 space-y-1">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-2">Menu</div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                <div>
                  <div className={cn("text-[13px] font-semibold leading-tight", isActive ? "text-primary" : "text-sidebar-foreground")}>{item.label}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{item.sublabel}</div>
                </div>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-border mx-1 !my-3" />

          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-2">Leitos</div>

          {/* Patients quick access */}
          <button
            onClick={() => setPatientsOpen(!patientsOpen)}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <BedDouble className="w-[18px] h-[18px]" />
              <div className="text-left">
                <div className="text-[13px] font-semibold text-sidebar-foreground leading-tight">Pacientes</div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{patients.length} internados</div>
              </div>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", patientsOpen && "rotate-180")} />
          </button>

          {patientsOpen && (
            <div className="ml-2 pl-4 border-l border-border space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {patients.length === 0 ? (
                <div className="text-muted-foreground text-[11px] py-3 px-2">
                  Nenhum paciente
                </div>
              ) : (
                <div className="max-h-52 overflow-auto space-y-0.5">
                  {patients.map((p) => (
                    <Link
                      key={p.id}
                      href={`/pacientes/${p.id}`}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-all duration-150",
                        pathname === `/pacientes/${p.id}`
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <span className="font-mono text-[11px] font-semibold text-primary w-5 text-right">{p.bed}</span>
                      <span className="text-[12px] truncate">{p.initials} &mdash; {p.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href="/pacientes/novo"
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-primary text-[12px] font-medium hover:bg-primary/10 transition-all duration-150"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo paciente
              </Link>
            </div>
          )}
        </nav>
      )}

      {collapsed && (
        <nav className="flex-1 flex flex-col items-center gap-1.5 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
            </Link>
          ))}
        </nav>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          >
            {theme === "dark" ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
            <span className="text-[13px] font-medium">{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="text-[13px] font-medium">Sair</span>
          </button>
        </div>
      )}
    </aside>
  );
}
