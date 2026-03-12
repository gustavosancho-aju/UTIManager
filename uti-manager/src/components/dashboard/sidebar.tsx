"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mic,
  BedDouble,
  ChevronDown,
  Hospital,
  Users,
  Plus,
} from "lucide-react";
import { getPatients } from "@/lib/supabase/patients";
import type { Patient } from "@/types/database";

const navItems = [
  { href: "/", label: "Dashboard", sublabel: "Visão gerencial da UTI", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", sublabel: "Gestão de leitos", icon: Users },
  { href: "/audio", label: "Novo Áudio", sublabel: "Registrar laudo por voz", icon: Mic },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [patientsOpen, setPatientsOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    getPatients().then(setPatients).catch(() => {});
  }, []);

  return (
    <aside
      className={cn(
        "flex flex-col bg-gradient-to-b from-sky-900 to-sky-950 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-72"
      )}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 p-5 border-b border-white/10 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-400 rounded-lg flex items-center justify-center shrink-0">
          <Hospital className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-extrabold text-sm tracking-wide">UTI Manager</div>
            <div className="text-white/50 text-[10px] uppercase tracking-widest">HUSE • Sergipe</div>
          </div>
        )}
      </div>

      {!collapsed && (
        <nav className="flex-1 overflow-auto py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.href} className="px-3 py-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-sky-500/20 border border-sky-500/30"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-sky-400" : "text-white/60")} />
                  <div>
                    <div className={cn("text-sm font-bold", isActive ? "text-white" : "text-white/85")}>{item.label}</div>
                    <div className="text-white/45 text-[11px]">{item.sublabel}</div>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-white/5 mx-5 my-1" />

          {/* Patients quick access */}
          <div className="px-3 py-1">
            <div
              onClick={() => setPatientsOpen(!patientsOpen)}
              className="flex items-center justify-between px-3.5 py-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <BedDouble className="w-5 h-5 text-white/60" />
                <div>
                  <div className="text-white/85 font-bold text-sm">Leitos</div>
                  <div className="text-white/45 text-[11px]">{patients.length} internados</div>
                </div>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", patientsOpen && "rotate-180")} />
            </div>

            {patientsOpen && (
              <div className="py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {patients.length === 0 ? (
                  <div className="text-white/30 text-[10px] text-center py-4">
                    Nenhum paciente cadastrado
                  </div>
                ) : (
                  <div className="space-y-0.5 max-h-48 overflow-auto">
                    {patients.map((p) => (
                      <Link
                        key={p.id}
                        href={`/pacientes/${p.id}`}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-md hover:bg-white/5 transition-all"
                      >
                        <span className="text-sky-400 font-bold text-xs w-6">{p.bed}</span>
                        <span className="text-white/70 text-xs truncate">{p.initials} — {p.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href="/pacientes/novo"
                  className="flex items-center gap-2 px-3.5 py-2 mt-1 rounded-md hover:bg-white/5 text-sky-400 text-xs font-medium transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo paciente
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}

      {collapsed && (
        <div className="flex-1 flex flex-col items-center gap-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                pathname === item.href ? "bg-sky-500/20" : "hover:bg-white/10"
              )}
            >
              <item.icon className="w-5 h-5 text-white/70" />
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
