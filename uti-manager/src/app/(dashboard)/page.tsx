"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Clock,
  Wind,
  Syringe,
  AlertTriangle,
  ArrowRight,
  Heart,
  Activity,
  Thermometer,
  Droplets,
} from "lucide-react";
import { getDashboardData, type PatientSummary } from "@/lib/supabase/dashboard";
import { GenderBadge } from "@/components/shared";

const DEVICE_CONFIG = [
  { key: "tot" as const, label: "Tubo Orotraqueal (TOT)", color: "bg-red-500", icon: "🫁" },
  { key: "cvc" as const, label: "Acesso Venoso Central", color: "bg-sky-500", icon: "💉" },
  { key: "svd" as const, label: "Sonda Vesical de Demora", color: "bg-amber-500", icon: "💧" },
  { key: "dva" as const, label: "Droga Vasoativa", color: "bg-rose-500", icon: "❤️" },
  { key: "sng" as const, label: "Sonda Nasogástrica", color: "bg-purple-500", icon: "🏥" },
  { key: "sne" as const, label: "Sonda Nasoentérica", color: "bg-pink-500", icon: "🏥" },
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

  // KPIs
  const onVentilation = data.filter((d) => d.devices.tot).length;
  const onDVA = data.filter((d) => d.devices.dva).length;
  const avgDays = total > 0 ? Math.round(data.reduce((a, d) => a + d.daysAdmitted, 0) / total) : 0;

  // Alerts
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
      if (d.daysAdmitted > 14) reasons.push(`${d.daysAdmitted} dias de internação`);
      if (d.latestVitals && d.latestVitals.sato2 < 94) reasons.push(`SatO2 ${d.latestVitals.sato2}%`);
      const severity = status.includes("choque") || status.includes("grave") ? "critical" : "warning";
      return { ...d, reasons, severity };
    });

  // Device counts
  const deviceCounts = DEVICE_CONFIG.map((dev) => ({
    ...dev,
    count: data.filter((d) => d.devices[dev.key]).length,
  }));

  const kpis = [
    { label: "Pacientes Internados", value: loading ? "..." : String(total), icon: BedDouble, color: "text-sky-500", bg: "bg-sky-50" },
    { label: "Tempo Médio Internação", value: loading ? "..." : `${avgDays}d`, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Ventilação Mecânica", value: loading ? "..." : String(onVentilation), icon: Wind, color: "text-red-500", bg: "bg-red-50" },
    { label: "Droga Vasoativa", value: loading ? "..." : String(onDVA), icon: Syringe, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-foreground">Dashboard — UTI HUSE</h1>
        <p className="text-sm text-muted-foreground">Visão gerencial em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{kpi.label}</div>
              <div className={`w-9 h-9 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Mapa de Leitos */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-sky-500 rounded-full" />
          <h2 className="text-lg font-extrabold text-foreground">Mapa de Leitos — Resumo por Paciente</h2>
        </div>

        {total === 0 ? (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
            <BedDouble className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum paciente cadastrado</p>
            <Link href="/pacientes/novo" className="text-sm text-sky-600 hover:underline font-medium mt-1 inline-block">
              Cadastrar primeiro paciente
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.map((item) => (
              <PatientCard key={item.patient.id} data={item} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom row: Dispositivos + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dispositivos em Uso */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-sky-500 rounded-full" />
            <h2 className="text-base font-extrabold text-foreground">Dispositivos em Uso</h2>
          </div>
          <div className="space-y-4">
            {deviceCounts.map((dev) => (
              <div key={dev.key} className="flex items-center gap-3">
                <span className="text-lg">{dev.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{dev.label}</span>
                    <span className="text-sm font-bold text-foreground">{dev.count}/{total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dev.color} rounded-full transition-all`}
                      style={{ width: total > 0 ? `${(dev.count / total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas e Atenções */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full" />
              <h2 className="text-base font-extrabold text-foreground">Alertas e Atenções</h2>
            </div>
            {alerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Link
                  key={alert.patient.id}
                  href={`/pacientes/${alert.patient.id}`}
                  className={`block rounded-xl p-4 border transition-colors ${
                    alert.severity === "critical"
                      ? "bg-red-50/50 border-red-200 hover:bg-red-50"
                      : "bg-amber-50/50 border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        alert.severity === "critical" ? "bg-red-500" : "bg-amber-400"
                      }`} />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {alert.patient.initials} (Leito {alert.patient.bed})
                        </p>
                        {alert.reasons.map((r, i) => (
                          <p key={i} className="text-xs text-muted-foreground">{r}</p>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
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
    if (s.includes("choque") || s.includes("grave")) return "text-red-600";
    if (s.includes("desmame") || s.includes("estável")) return "text-green-600";
    return "text-amber-600";
  })();

  const activeDevices = Object.entries(devices)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase());

  const deviceColors: Record<string, string> = {
    TOT: "bg-red-100 text-red-700",
    CVC: "bg-sky-100 text-sky-700",
    SVD: "bg-amber-100 text-amber-700",
    DVA: "bg-rose-100 text-rose-700",
    SNG: "bg-purple-100 text-purple-700",
    SNE: "bg-pink-100 text-pink-700",
  };

  return (
    <Link
      href={`/pacientes/${patient.id}`}
      className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:border-sky-300 hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-sky-50 border-2 border-sky-200 rounded-xl flex items-center justify-center">
            <span className="text-sky-700 font-extrabold text-sm">{patient.bed}</span>
          </div>
          <span className="text-lg font-extrabold text-foreground">{patient.initials}</span>
          <GenderBadge gender={patient.gender} />
        </div>
        <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-sky-200">
          D{daysAdmitted}
        </span>
      </div>

      {/* Diagnosis */}
      <p className="text-sm text-muted-foreground mb-1">{patient.main_diagnosis}</p>
      <p className={`text-sm font-bold ${statusColor} mb-3`}>{patient.clinical_status}</p>

      {/* Vitals */}
      {latestVitals && (
        <div className="flex items-center gap-4 text-xs mb-3">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400" />
            PA <strong>{latestVitals.pa}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Activity className={`w-3 h-3 ${latestVitals.fc > 120 || latestVitals.fc < 50 ? "text-red-500" : "text-orange-400"}`} />
            FC <strong className={latestVitals.fc > 120 || latestVitals.fc < 50 ? "text-red-600" : ""}>{latestVitals.fc}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Thermometer className={`w-3 h-3 ${latestVitals.temp > 38 ? "text-red-500" : "text-amber-400"}`} />
            T <strong className={latestVitals.temp > 38 ? "text-red-600" : ""}>{latestVitals.temp}°</strong>
          </span>
          <span className="flex items-center gap-1">
            <Droplets className={`w-3 h-3 ${latestVitals.sato2 < 94 ? "text-red-500" : "text-sky-400"}`} />
            Sat <strong className={latestVitals.sato2 < 94 ? "text-red-600" : ""}>{latestVitals.sato2}%</strong>
          </span>
        </div>
      )}

      {/* Devices */}
      {activeDevices.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeDevices.map((d) => (
            <span key={d} className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${deviceColors[d] || "bg-gray-100 text-gray-700"}`}>
              {d}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
