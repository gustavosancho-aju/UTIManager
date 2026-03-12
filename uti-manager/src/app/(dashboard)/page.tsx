"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Clock,
  Wind,
  Syringe,
  ArrowRight,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  TrendingUp,
} from "lucide-react";
import { getDashboardData, type PatientSummary } from "@/lib/supabase/dashboard";
import { GenderBadge } from "@/components/shared";

const DEVICE_CONFIG = [
  { key: "tot" as const, label: "TOT", fullLabel: "Tubo Orotraqueal", color: "bg-red-500" },
  { key: "cvc" as const, label: "CVC", fullLabel: "Acesso Venoso Central", color: "bg-teal" },
  { key: "svd" as const, label: "SVD", fullLabel: "Sonda Vesical de Demora", color: "bg-amber-500" },
  { key: "dva" as const, label: "DVA", fullLabel: "Droga Vasoativa", color: "bg-rose-500" },
  { key: "sng" as const, label: "SNG", fullLabel: "Sonda Nasogastrica", color: "bg-violet-500" },
  { key: "sne" as const, label: "SNE", fullLabel: "Sonda Nasoenterica", color: "bg-pink-500" },
];

export default function DashboardPage() {
  const [data, setData] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = data.length;
  const onVentilation = data.filter((d) => d.devices.tot).length;
  const onDVA = data.filter((d) => d.devices.dva).length;
  const avgDays = total > 0 ? Math.round(data.reduce((a, d) => a + d.daysAdmitted, 0) / total) : 0;

  const alerts = data
    .filter((d) => {
      const status = d.patient.clinical_status?.toLowerCase() || "";
      return (
        status.includes("choque") ||
        status.includes("grave") ||
        status.includes("instável") ||
        d.daysAdmitted > 14 ||
        (d.latestVitals && d.latestVitals.sato2 < 94)
      );
    })
    .map((d) => {
      const reasons: string[] = [];
      const status = d.patient.clinical_status?.toLowerCase() || "";
      if (status.includes("choque") || status.includes("grave") || status.includes("instável")) {
        reasons.push(d.patient.clinical_status);
      }
      if (d.daysAdmitted > 14) reasons.push(`${d.daysAdmitted} dias de internacao`);
      if (d.latestVitals && d.latestVitals.sato2 < 94) reasons.push(`SatO2 ${d.latestVitals.sato2}%`);
      const severity = status.includes("choque") || status.includes("grave") ? "critical" : "warning";
      return { ...d, reasons, severity };
    });

  const deviceCounts = DEVICE_CONFIG.map((dev) => ({
    ...dev,
    count: data.filter((d) => d.devices[dev.key]).length,
  }));

  const kpis = [
    { label: "Pacientes", value: loading ? "--" : String(total), icon: BedDouble, accent: "text-primary", bgAccent: "bg-primary/10" },
    { label: "Tempo Medio", value: loading ? "--" : `${avgDays}d`, icon: Clock, accent: "text-amber-400", bgAccent: "bg-amber-400/10" },
    { label: "Ventilacao", value: loading ? "--" : String(onVentilation), icon: Wind, accent: "text-red-400", bgAccent: "bg-red-400/10" },
    { label: "DVA", value: loading ? "--" : String(onDVA), icon: Syringe, accent: "text-violet-400", bgAccent: "bg-violet-400/10" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">UTI HUSE &mdash; Visao gerencial em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all duration-300 group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">{kpi.label}</span>
              <div className={`w-8 h-8 ${kpi.bgAccent} rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <kpi.icon className={`w-4 h-4 ${kpi.accent}`} />
              </div>
            </div>
            <div className="font-display text-3xl font-extrabold text-foreground tracking-tight">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Mapa de Leitos */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h2 className="font-display text-base font-bold text-foreground tracking-tight">Mapa de Leitos</h2>
          <span className="text-xs text-muted-foreground">({total} pacientes)</span>
        </div>

        {total === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center">
            <BedDouble className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">Nenhum paciente cadastrado</p>
            <Link href="/pacientes/novo" className="text-sm text-primary hover:underline font-medium">
              Cadastrar primeiro paciente
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.map((item) => (
              <PatientCard key={item.patient.id} data={item} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dispositivos */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="font-display text-sm font-bold text-foreground tracking-tight">Dispositivos em Uso</h2>
          </div>
          <div className="space-y-3.5">
            {deviceCounts.map((dev) => (
              <div key={dev.key} className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-bold text-muted-foreground w-8">{dev.label}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{dev.fullLabel}</span>
                    <span className="font-mono text-xs font-bold text-foreground">{dev.count}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dev.color} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: total > 0 ? `${(dev.count / total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-destructive rounded-full" />
              <h2 className="font-display text-sm font-bold text-foreground tracking-tight">Alertas</h2>
            </div>
            {alerts.length > 0 && (
              <span className="bg-destructive text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center pulse-alert">
                {alerts.length}
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <Link
                  key={alert.patient.id}
                  href={`/pacientes/${alert.patient.id}`}
                  className={`block rounded-lg p-3.5 border transition-all duration-200 hover:translate-x-0.5 ${
                    alert.severity === "critical"
                      ? "bg-red-500/5 border-red-500/15 hover:border-red-500/30"
                      : "bg-amber-500/5 border-amber-500/15 hover:border-amber-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        alert.severity === "critical" ? "bg-red-500 pulse-alert" : "bg-amber-400"
                      }`} />
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">
                          {alert.patient.initials} &middot; Leito {alert.patient.bed}
                        </p>
                        {alert.reasons.map((r, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground">{r}</p>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientCard({ data }: { data: PatientSummary }) {
  const { patient, latestVitals, daysAdmitted, devices } = data;

  const statusColor = (() => {
    const s = patient.clinical_status?.toLowerCase() || "";
    if (s.includes("choque") || s.includes("grave")) return "text-red-400";
    if (s.includes("desmame") || s.includes("estável")) return "text-emerald-400";
    return "text-amber-400";
  })();

  const activeDevices = Object.entries(devices)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase());

  const deviceColors: Record<string, string> = {
    TOT: "bg-red-500/15 text-red-400 border-red-500/20",
    CVC: "bg-teal/15 text-teal border-teal/20",
    SVD: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    DVA: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    SNG: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    SNE: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  };

  return (
    <Link
      href={`/pacientes/${patient.id}`}
      className="glass-card rounded-xl p-5 hover:border-primary/25 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center group-hover:glow-teal transition-all duration-300">
            <span className="text-primary font-display font-extrabold text-sm">{patient.bed}</span>
          </div>
          <span className="font-display text-base font-bold text-foreground">{patient.initials}</span>
          <GenderBadge gender={patient.gender} />
        </div>
        <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
          D{daysAdmitted}
        </span>
      </div>

      <p className="text-[13px] text-muted-foreground mb-1 truncate">{patient.main_diagnosis}</p>
      <p className={`text-[13px] font-semibold ${statusColor} mb-3`}>{patient.clinical_status}</p>

      {latestVitals && (
        <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400" />
            <span className="font-mono font-semibold text-foreground">{latestVitals.pa}</span>
          </span>
          <span className="flex items-center gap-1">
            <Activity className={`w-3 h-3 ${latestVitals.fc > 120 || latestVitals.fc < 50 ? "text-red-400" : "text-amber-400"}`} />
            <span className={`font-mono font-semibold ${latestVitals.fc > 120 || latestVitals.fc < 50 ? "text-red-400" : "text-foreground"}`}>{latestVitals.fc}</span>
          </span>
          <span className="flex items-center gap-1">
            <Thermometer className={`w-3 h-3 ${latestVitals.temp > 38 ? "text-red-400" : "text-amber-400"}`} />
            <span className={`font-mono font-semibold ${latestVitals.temp > 38 ? "text-red-400" : "text-foreground"}`}>{latestVitals.temp}°</span>
          </span>
          <span className="flex items-center gap-1">
            <Droplets className={`w-3 h-3 ${latestVitals.sato2 < 94 ? "text-red-400" : "text-primary"}`} />
            <span className={`font-mono font-semibold ${latestVitals.sato2 < 94 ? "text-red-400" : "text-foreground"}`}>{latestVitals.sato2}%</span>
          </span>
        </div>
      )}

      {activeDevices.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeDevices.map((d) => (
            <span key={d} className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${deviceColors[d] || "bg-secondary text-muted-foreground border-border"}`}>
              {d}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
