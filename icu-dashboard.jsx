import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const INITIAL_PATIENTS = [
  {
    id: 1, initials: "EAS", name: "E. A. S.", gender: "F", birthDate: "1965-08-14",
    registration: "UTI-2026-0847", bed: "03", unit: "UTI Adulto",
    admissionDate: "2026-02-27",
    admissionReason: "Estado de mal convulsivo → Coma",
    mainDiagnosis: "Estado de mal epiléptico refratário",
    clinicalStatus: "Em choque — uso de DVA",
    vitals: [
      { date: "2026-03-09", time: "14:20", pa: "100/60", fc: 100, temp: 37.0, sato2: 100, author: "Dr. Carlos" },
      { date: "2026-03-09", time: "10:00", pa: "95/55", fc: 108, temp: 37.2, sato2: 99, author: "Enf. Paula" },
      { date: "2026-03-09", time: "06:00", pa: "90/58", fc: 112, temp: 37.5, sato2: 98, author: "Dr. Carlos" },
      { date: "2026-03-08", time: "22:00", pa: "88/52", fc: 115, temp: 37.8, sato2: 97, author: "Dra. Ana" },
      { date: "2026-03-08", time: "14:00", pa: "92/60", fc: 110, temp: 37.4, sato2: 98, author: "Dr. Carlos" },
      { date: "2026-03-08", time: "06:30", pa: "85/50", fc: 120, temp: 38.1, sato2: 96, author: "Enf. Paula" },
      { date: "2026-03-07", time: "14:00", pa: "80/48", fc: 125, temp: 38.4, sato2: 95, author: "Dr. Carlos" },
      { date: "2026-03-07", time: "06:00", pa: "78/45", fc: 130, temp: 38.6, sato2: 94, author: "Dra. Ana" },
    ],
    reports: [
      {
        id: 1, date: "2026-03-09", time: "14:20", author: "Dr. Carlos Mendonça",
        transcription: "Paciente do sexo feminino, iniciais EAS, internada nessa unidade de terapia intensiva no dia 27 de fevereiro de 2026. Foi internada por um estado de mal convulsivo e entrou em coma. A partir daí ela foi intubada, tá sedada, em ventilação mecânica com choques e utilização de droga vasoativa. De dispositivos ela tá usando um tubo orotraqueal, cateter venoso central na subclávia direita, sonda vesical de demora e sonda nasogástrica para alimentação. Tá recebendo como sedativo Precedex e Fentanil, e com noradrenalina 5 ml/hora para manter a pressão. Sinais vitais no momento: PA de 10 por 6, frequência cardíaca de 100, temperatura de 37 e saturando 100%.",
        devices: { tot: { active: true, details: "Tubo orotraqueal" }, sondaVesical: { active: true, details: "Sonda vesical de demora" }, acessoVenoso: { active: true, details: "CVC subclávia direita" }, sng: { active: true, details: "Sonda nasogástrica — alimentação" }, sne: { active: false, details: "" }, dva: { active: true, details: "Noradrenalina 5 ml/h" } },
        ventilation: { mode: "VM", fio2: "—", peep: "—" },
        sedation: { drugs: "Precedex + Fentanil", rass: "Coma" },
        antibiotics: "Não informado", hemodynamics: "Em choque — Noradrenalina 5 ml/h",
        clinicalCondition: "Em choque", diuresis: "Não informado",
        vitalSigns: { pa: "100/60", fc: 100, temp: 37.0, sato2: 100 },
      },
      {
        id: 2, date: "2026-03-08", time: "14:00", author: "Dr. Carlos Mendonça",
        transcription: "Paciente EAS, 10º dia UTI. Mantém quadro de coma pós estado de mal epiléptico. Hemodinamicamente instável, noradrenalina aumentada de 3 para 5 ml/h. Pico febril de 38.1 às 06h. Coletadas culturas de sangue e urina. Mantém ventilação mecânica sem condições de desmame. Sedação mantida com Precedex e Fentanil.",
        devices: { tot: { active: true, details: "Tubo orotraqueal" }, sondaVesical: { active: true, details: "Sonda vesical de demora" }, acessoVenoso: { active: true, details: "CVC subclávia direita" }, sng: { active: true, details: "Sonda nasogástrica — alimentação" }, sne: { active: false, details: "" }, dva: { active: true, details: "Noradrenalina 3→5 ml/h" } },
        ventilation: { mode: "VM", fio2: "—", peep: "—" },
        sedation: { drugs: "Precedex + Fentanil", rass: "Coma" },
        antibiotics: "Aguardando culturas", hemodynamics: "Instável — NOR 3→5 ml/h",
        clinicalCondition: "Em choque — piora hemodinâmica", diuresis: "Não informado",
        vitalSigns: { pa: "92/60", fc: 110, temp: 37.4, sato2: 98 },
      },
    ],
    checklist: {
      analgesiaSedacao: { semDor: true, diminuirSedacao: false, sedacaoMeta: true, contencao: false, agitacao: null },
      dieta: { adequada: true, jejum12h: false },
      prevComplicacoes: { profilaxiaUlcera: true, profilaxiaTVP: true, controleGlicemico: true },
      prevPneumonia: { protecaoVentilatoria: true, criterioTRE: false, extubacao: false },
      prevIPCS: { svdRemover: false, cvcRemover: false },
      antibioticos: { doseCorreta: null, descalonar: null },
      exames: { culturas: true, examesPendentes: true, procedimentos: false, especialista: true },
      planejamento: { feito: true, metasAlcancadas: false, revisao: true },
      conformidades: { pulseira: true, cabeceira: true, filtroBarreira: true, curativoCVC: true, equipamentos: true, svdFixada: true, bolsaColetora: true },
    },
  },
  {
    id: 2, initials: "JPO", name: "J. P. O.", gender: "M", birthDate: "1972-11-23",
    registration: "UTI-2026-0852", bed: "07", unit: "UTI Adulto",
    admissionDate: "2026-03-06",
    admissionReason: "Pós-op laparotomia — perfuração de cólon",
    mainDiagnosis: "Sepse de foco abdominal pós-operatório",
    clinicalStatus: "Em desmame de DVA",
    vitals: [
      { date: "2026-03-09", time: "08:00", pa: "120/75", fc: 88, temp: 36.8, sato2: 97, author: "Dr. Carlos" },
      { date: "2026-03-09", time: "02:00", pa: "115/70", fc: 92, temp: 37.0, sato2: 96, author: "Enf. Paula" },
      { date: "2026-03-08", time: "20:00", pa: "110/68", fc: 96, temp: 37.3, sato2: 96, author: "Dra. Ana" },
      { date: "2026-03-08", time: "08:00", pa: "105/65", fc: 100, temp: 37.6, sato2: 95, author: "Dr. Carlos" },
    ],
    reports: [
      {
        id: 1, date: "2026-03-09", time: "08:00", author: "Dr. Carlos Mendonça",
        transcription: "Paciente do sexo masculino, iniciais JPO, leito 07, terceiro dia de UTI. Pós-operatório de laparotomia exploradora por perfuração de cólon. Diagnóstico: sepse de foco abdominal. Extubado ontem com sucesso. Sonda vesical de demora. Acesso venoso central em jugular interna direita, triplo lúmen. Dreno de Blake em flanco direito. Meropenem D3 e vancomicina D3. Noradrenalina em desmame, 0.05 mcg/kg/min. Dieta zero, NPT em curso. PA 120 por 75, FC 88, temp 36.8, sat 97.",
        devices: { tot: { active: false, details: "Extubado D1 (ontem)" }, sondaVesical: { active: true, details: "Demora" }, acessoVenoso: { active: true, details: "CVC jugular ID, triplo lúmen" }, sng: { active: false, details: "" }, sne: { active: false, details: "" }, dva: { active: true, details: "Noradrenalina 0.05 mcg/kg/min (desmame)" } },
        ventilation: { mode: "Ar ambiente", fio2: "21%", peep: "—" },
        sedation: { drugs: "Sem sedação", rass: "0" },
        antibiotics: "Meropenem D3 + Vancomicina D3", hemodynamics: "Noradrenalina em desmame",
        clinicalCondition: "Em desmame de DVA", diuresis: "Satisfatório",
        vitalSigns: { pa: "120/75", fc: 88, temp: 36.8, sato2: 97 },
      },
    ],
    checklist: {
      analgesiaSedacao: { semDor: true, diminuirSedacao: null, sedacaoMeta: null, contencao: false, agitacao: null },
      dieta: { adequada: false, jejum12h: true },
      prevComplicacoes: { profilaxiaUlcera: true, profilaxiaTVP: true, controleGlicemico: true },
      prevPneumonia: { protecaoVentilatoria: null, criterioTRE: null, extubacao: null },
      prevIPCS: { svdRemover: true, cvcRemover: false },
      antibioticos: { doseCorreta: true, descalonar: false },
      exames: { culturas: true, examesPendentes: false, procedimentos: false, especialista: true },
      planejamento: { feito: true, metasAlcancadas: true, revisao: false },
      conformidades: { pulseira: true, cabeceira: true, filtroBarreira: null, curativoCVC: true, equipamentos: true, svdFixada: true, bolsaColetora: true },
    },
  },
  {
    id: 3, initials: "MRF", name: "M. R. F.", gender: "M", birthDate: "1980-03-10",
    registration: "UTI-2026-0855", bed: "01", unit: "UTI Adulto",
    admissionDate: "2026-03-08",
    admissionReason: "Politraumatismo — acidente automobilístico",
    mainDiagnosis: "TCE grave + contusão pulmonar bilateral",
    clinicalStatus: "Grave — sedado em VM",
    vitals: [
      { date: "2026-03-09", time: "12:00", pa: "130/80", fc: 78, temp: 36.5, sato2: 98, author: "Dr. Carlos" },
      { date: "2026-03-09", time: "06:00", pa: "125/78", fc: 82, temp: 36.7, sato2: 97, author: "Enf. Paula" },
    ],
    reports: [
      {
        id: 1, date: "2026-03-09", time: "12:00", author: "Dr. Carlos Mendonça",
        transcription: "Paciente MRF, sexo masculino, leito 01, segundo dia UTI. Admitido por politraumatismo, TCE grave com Glasgow 6. Contusão pulmonar bilateral. Intubado, sedado com midazolam e fentanil, RASS -4. VM modo PCV, FiO2 50%, PEEP 10. CVC em subclávia esquerda, SVD, SNE. Sem DVA. Hemodinamicamente estável. Pupilas isocóricas mióticas. Meropenem D1 profilático.",
        devices: { tot: { active: true, details: "TOT nº 8.0" }, sondaVesical: { active: true, details: "SVD demora" }, acessoVenoso: { active: true, details: "CVC subclávia E" }, sng: { active: false, details: "" }, sne: { active: true, details: "SNE para dieta" }, dva: { active: false, details: "" } },
        ventilation: { mode: "PCV", fio2: "50%", peep: "10" },
        sedation: { drugs: "Midazolam + Fentanil", rass: "-4" },
        antibiotics: "Meropenem D1", hemodynamics: "Estável sem DVA",
        clinicalCondition: "Grave — sedado", diuresis: "Adequado",
        vitalSigns: { pa: "130/80", fc: 78, temp: 36.5, sato2: 98 },
      },
    ],
    checklist: {
      analgesiaSedacao: { semDor: true, diminuirSedacao: false, sedacaoMeta: true, contencao: false, agitacao: null },
      dieta: { adequada: true, jejum12h: false },
      prevComplicacoes: { profilaxiaUlcera: true, profilaxiaTVP: true, controleGlicemico: true },
      prevPneumonia: { protecaoVentilatoria: true, criterioTRE: false, extubacao: false },
      prevIPCS: { svdRemover: false, cvcRemover: false },
      antibioticos: { doseCorreta: true, descalonar: false },
      exames: { culturas: true, examesPendentes: true, procedimentos: true, especialista: true },
      planejamento: { feito: true, metasAlcancadas: false, revisao: true },
      conformidades: { pulseira: true, cabeceira: true, filtroBarreira: true, curativoCVC: true, equipamentos: true, svdFixada: true, bolsaColetora: true },
    },
  },
  {
    id: 4, initials: "ACL", name: "A. C. L.", gender: "F", birthDate: "1948-12-02",
    registration: "UTI-2026-0860", bed: "10", unit: "UTI Adulto",
    admissionDate: "2026-02-18",
    admissionReason: "Insuficiência respiratória aguda — DPOC exacerbada",
    mainDiagnosis: "DPOC exacerbada + pneumonia associada",
    clinicalStatus: "Estável — em desmame ventilatório",
    vitals: [
      { date: "2026-03-09", time: "10:30", pa: "135/85", fc: 74, temp: 36.4, sato2: 94, author: "Dra. Ana" },
      { date: "2026-03-09", time: "06:00", pa: "130/82", fc: 76, temp: 36.6, sato2: 93, author: "Enf. Paula" },
      { date: "2026-03-08", time: "18:00", pa: "128/80", fc: 80, temp: 36.8, sato2: 92, author: "Dra. Ana" },
    ],
    reports: [
      {
        id: 1, date: "2026-03-09", time: "10:30", author: "Dra. Ana Beatriz",
        transcription: "Paciente ACL, sexo feminino, leito 10, 19º dia de UTI. DPOC exacerbada com pneumonia associada. Em desmame ventilatório, modo PSV, FiO2 30%, PEEP 5. Traqueostomizada D5. SVD, CVC em jugular D. SNE para dieta enteral. Sem DVA, hemodinamicamente estável. Antibiótico piperacilina-tazobactam D10. Lúcida, cooperativa, RASS 0.",
        devices: { tot: { active: false, details: "TQT D5 (traqueostomia)" }, sondaVesical: { active: true, details: "SVD demora" }, acessoVenoso: { active: true, details: "CVC jugular D" }, sng: { active: false, details: "" }, sne: { active: true, details: "SNE — dieta enteral" }, dva: { active: false, details: "" } },
        ventilation: { mode: "PSV", fio2: "30%", peep: "5" },
        sedation: { drugs: "Sem sedação", rass: "0" },
        antibiotics: "Piperacilina-Tazobactam D10", hemodynamics: "Estável sem DVA",
        clinicalCondition: "Estável — desmame ventilatório", diuresis: "Adequado",
        vitalSigns: { pa: "135/85", fc: 74, temp: 36.4, sato2: 94 },
      },
    ],
    checklist: {
      analgesiaSedacao: { semDor: true, diminuirSedacao: null, sedacaoMeta: null, contencao: false, agitacao: null },
      dieta: { adequada: true, jejum12h: false },
      prevComplicacoes: { profilaxiaUlcera: true, profilaxiaTVP: true, controleGlicemico: true },
      prevPneumonia: { protecaoVentilatoria: true, criterioTRE: true, extubacao: false },
      prevIPCS: { svdRemover: true, cvcRemover: true },
      antibioticos: { doseCorreta: true, descalonar: true },
      exames: { culturas: true, examesPendentes: false, procedimentos: false, especialista: false },
      planejamento: { feito: true, metasAlcancadas: true, revisao: false },
      conformidades: { pulseira: true, cabeceira: true, filtroBarreira: true, curativoCVC: true, equipamentos: true, svdFixada: true, bolsaColetora: true },
    },
  },
];

const TODAY = "2026-03-09";
const getDays = (d) => Math.max(1, Math.floor((new Date(TODAY) - new Date(d)) / 864e5));
const dayColor = (d) => d <= 7 ? "#22c55e" : d <= 14 ? "#eab308" : d <= 21 ? "#f97316" : "#ef4444";

// ═══════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════

function StatusBadge({ active, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)", color: active ? "#dc2626" : "#16a34a", border: `1px solid ${active ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#dc2626" : "#16a34a", boxShadow: active ? "0 0 6px rgba(239,68,68,0.5)" : "0 0 6px rgba(34,197,94,0.4)" }} />
      {label}
    </span>
  );
}

function CheckIcon({ value }) {
  if (value === true) return <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 16 }}>✓</span>;
  if (value === false) return <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 16 }}>✗</span>;
  return <span style={{ color: "#9ca3af", fontWeight: 500, fontSize: 12 }}>N/A</span>;
}

function GenderBadge({ gender }) {
  const isF = gender === "F";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: isF ? "rgba(236,72,153,0.1)" : "rgba(59,130,246,0.1)", color: isF ? "#db2777" : "#2563eb", border: `1px solid ${isF ? "rgba(236,72,153,0.2)" : "rgba(59,130,246,0.2)"}` }}>
      {isF ? "♀" : "♂"} {isF ? "Fem" : "Masc"}
    </span>
  );
}

function DeviceCard({ icon, name, active, details }) {
  return (
    <div style={{ background: active ? "linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.01))" : "linear-gradient(135deg, rgba(34,197,94,0.05), rgba(34,197,94,0.01))", border: `1px solid ${active ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"}`, borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, minWidth: 170 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <StatusBadge active={active} label={active ? "Em uso" : "Removido"} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{name}</div>
      {details && <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{details}</div>}
    </div>
  );
}

function VitalCard({ icon, label, value, unit, color, alert }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "16px 18px", border: `1px solid ${alert ? `${color}30` : "#e2e8f0"}`, boxShadow: alert ? `0 0 16px ${color}12` : "0 2px 8px rgba(0,0,0,0.03)", minWidth: 120, position: "relative", overflow: "hidden" }}>
      {alert && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />}
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>{icon}</span> {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{value}<span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", marginLeft: 4 }}>{unit}</span></div>
    </div>
  );
}

function VitalsTimeline({ vitals }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? vitals : vitals.slice(0, 6);
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
          <thead><tr>
            {["Data/Hora", "PA", "FC", "Temp", "SatO₂", "Por"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", fontWeight: 700, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {displayed.map((v, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white" }}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0c4a6e", whiteSpace: "nowrap" }}>{v.date.slice(5)} <span style={{ color: "#94a3b8", fontWeight: 400 }}>{v.time}</span></td>
                <td style={{ padding: "10px 14px", fontWeight: 700 }}>{v.pa}</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: v.fc > 120 ? "#dc2626" : v.fc > 100 ? "#ea580c" : "#0f172a" }}>{v.fc}</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: v.temp >= 38 ? "#dc2626" : v.temp >= 37.5 ? "#ea580c" : "#0f172a" }}>{v.temp.toFixed(1)}</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: v.sato2 < 95 ? "#dc2626" : v.sato2 < 97 ? "#ea580c" : "#16a34a" }}>{v.sato2}%</td>
                <td style={{ padding: "10px 14px", color: "#64748b", fontSize: 12 }}>{v.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {vitals.length > 6 && (
        <button onClick={() => setShowAll(!showAll)} style={{ marginTop: 10, padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#0ea5e9", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {showAll ? "Mostrar menos" : `Ver todos (${vitals.length})`}
        </button>
      )}
    </div>
  );
}

function MiniInfo({ label, value, color }) {
  return (
    <div style={{ background: `${color}08`, border: `1px solid ${color}18`, borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function MiniChart({ data, dataKey, color, height = 50 }) {
  const vals = data.map((d) => d[dataKey]);
  const max = Math.max(...vals); const min = Math.min(...vals); const range = max - min || 1;
  const reversed = [...data].reverse();
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 2, height, padding: "0 2px" }}>
      {reversed.map((d, i) => {
        const h = Math.max(8, ((d[dataKey] - min) / range) * height * 0.85);
        return <div key={i} title={`${d.date} ${d.time}: ${d[dataKey]}`} style={{ flex: 1, height: h, minWidth: 6, maxWidth: 14, background: `linear-gradient(to top, ${color}90, ${color})`, borderRadius: "3px 3px 0 0", cursor: "pointer", opacity: i === reversed.length - 1 ? 1 : 0.65 }} />;
      })}
    </div>
  );
}

function TimelineItem({ report, isLast }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", border: "3px solid #e0f2fe", zIndex: 1 }} />
        {!isLast && <div style={{ width: 2, flex: 1, background: "linear-gradient(to bottom, #bae6fd, transparent)", marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 24 }}>
        <div onClick={() => setExpanded(!expanded)} style={{ background: "white", borderRadius: 14, padding: "16px 20px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: expanded ? "0 4px 20px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: expanded ? 14 : 0 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#0c4a6e" }}>{report.date}</span>
              <span style={{ color: "#94a3b8", margin: "0 8px" }}>•</span>
              <span style={{ color: "#64748b", fontSize: 13 }}>{report.time}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>{report.author}</span>
              <span style={{ fontSize: 11, color: "#94a3b8", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
            </div>
          </div>
          {expanded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, fontSize: 13, color: "#334155", lineHeight: 1.65, borderLeft: "3px solid #0ea5e9" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#0ea5e9", marginBottom: 6 }}>🎙️ Transcrição</div>
                {report.transcription}
              </div>
              {report.vitalSigns && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
                  <VitalCard icon="🩸" label="PA" value={report.vitalSigns.pa} unit="mmHg" color="#dc2626" />
                  <VitalCard icon="💓" label="FC" value={report.vitalSigns.fc} unit="bpm" color="#ea580c" alert={report.vitalSigns.fc > 100} />
                  <VitalCard icon="🌡️" label="Temp" value={report.vitalSigns.temp.toFixed(1)} unit="°C" color="#f59e0b" alert={report.vitalSigns.temp >= 37.8} />
                  <VitalCard icon="💨" label="SatO₂" value={report.vitalSigns.sato2} unit="%" color="#16a34a" alert={report.vitalSigns.sato2 < 95} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                <MiniInfo label="Condição" value={report.clinicalCondition || "—"} color="#dc2626" />
                <MiniInfo label="Ventilação" value={`${report.ventilation.mode} | FiO₂ ${report.ventilation.fio2} | PEEP ${report.ventilation.peep}`} color="#7c3aed" />
                <MiniInfo label="Sedação" value={`${report.sedation.drugs} | RASS ${report.sedation.rass}`} color="#0ea5e9" />
                <MiniInfo label="ATB" value={report.antibiotics} color="#ea580c" />
                <MiniInfo label="Hemodinâmica" value={report.hemodynamics} color="#16a34a" />
                <MiniInfo label="Diurese" value={report.diuresis} color="#8b5cf6" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChecklistSection({ title, items }) {
  const yesCount = items.filter((i) => i.value === true).length;
  const total = items.filter((i) => i.value !== null).length;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#0c4a6e", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #e2e8f0" }}>
        <span>{title}</span>
        {total > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: yesCount === total ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)", color: yesCount === total ? "#16a34a" : "#ca8a04" }}>{yesCount}/{total}</span>}
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", borderRadius: 6, background: i % 2 === 0 ? "#f8fafc" : "transparent", fontSize: 13, color: "#475569" }}>
          <span>{item.label}</span><CheckIcon value={item.value} />
        </div>
      ))}
    </div>
  );
}

function StayDaysBar({ admissionDate }) {
  const days = getDays(admissionDate); const pct = Math.min((days / 30) * 100, 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: "#0f172a" }}>{days}</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>dias</span>
      </div>
      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${dayColor(days)}cc, ${dayColor(days)})`, borderRadius: 10, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "right" }}>Admissão: {new Date(admissionDate + "T12:00:00").toLocaleDateString("pt-BR")}</div>
    </div>
  );
}

const AI_SYSTEM_PROMPT = `Você é um assistente médico especializado em UTI. Receba a transcrição de um áudio médico e extraia dados estruturados.

REGRAS:
- Extraia APENAS o que foi explicitamente mencionado
- Use null para campos não mencionados
- Para dispositivos, marque active: true/false baseado no contexto
- PA deve estar no formato "XXX/XX" (converter "10 por 6" para "100/60")
- Temperatura: número decimal
- FC e SatO2: números inteiros
- DVA: inclua droga e dose exatamente como mencionado (ml/h ou mcg/kg/min)
- RASS: string (pode ser número ou "Coma", "Agitado", etc)
- bed: número do leito se mencionado

Responda APENAS com JSON válido, sem markdown, sem backticks, sem explicação:
{
  "gender": "M" ou "F" ou null,
  "initials": "XXX" ou null,
  "bed": "XX" ou null,
  "admissionDate": "YYYY-MM-DD" ou null,
  "admissionReason": "texto" ou null,
  "mainDiagnosis": "texto" ou null,
  "clinicalCondition": "texto" ou null,
  "devices": {
    "tot": { "active": bool, "details": "texto" },
    "sondaVesical": { "active": bool, "details": "texto" },
    "acessoVenoso": { "active": bool, "details": "texto" },
    "sng": { "active": bool, "details": "texto" },
    "sne": { "active": bool, "details": "texto" },
    "dva": { "active": bool, "details": "texto" }
  },
  "ventilation": { "mode": "texto", "fio2": "texto", "peep": "texto" },
  "sedation": { "drugs": "texto", "rass": "texto" },
  "antibiotics": "texto",
  "hemodynamics": "texto",
  "diuresis": "texto",
  "vitalSigns": { "pa": "XXX/XX", "fc": numero, "temp": numero, "sato2": numero }
}`;

function AudioChatView({ patients, onSaveReport, onCreatePatient }) {
  const [mode, setMode] = useState(null); // null | "existing" | "new"
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [transcription, setTranscription] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const intervalRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const speechAvailable = !!SpeechRecognition;

  const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, processing]);

  const startRecording = () => {
    if (!speechAvailable) return;
    setError(null);
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR"; recognition.continuous = true; recognition.interimResults = true; recognition.maxAlternatives = 1;
    let finalTranscript = transcription;
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) { finalTranscript += (finalTranscript ? " " : "") + t; } else { interim = t; }
      }
      setTranscription(finalTranscript + (interim ? " " + interim : ""));
    };
    recognition.onerror = (e) => { if (e.error !== "no-speech") setError(`Erro: ${e.error}`); };
    recognition.onend = () => { if (recognitionRef.current && recording) { try { recognition.start(); } catch(e) {} } };
    try { recognition.start(); recognitionRef.current = recognition; setRecording(true); setSeconds(0); intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000); } catch(e) { setError("Microfone indisponível."); }
  };
  const stopRecording = () => { if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); recognitionRef.current = null; } setRecording(false); clearInterval(intervalRef.current); };
  useEffect(() => () => { stopRecording(); clearInterval(intervalRef.current); }, []);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const t = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { type: "system", text: `Arquivo recebido: ${file.name}. Cole a transcrição ou use o microfone.`, time: t }]);
    e.target.value = "";
  };

  const handleSend = async () => {
    const text = transcription.trim(); if (!text || recording) return;
    const now = new Date(); const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { type: "user", text, time: timeStr }]);
    setTranscription(""); setProcessing(true); setError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: AI_SYSTEM_PROMPT, messages: [{ role: "user", content: `Transcrição do áudio médico:\n\n"${text}"` }] }),
      });
      const data = await response.json();
      const rawText = data.content?.map((b) => b.text || "").join("") || "";
      const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());

      // For existing patients, force use selected patient
      let matched = null;
      if (mode === "existing" && selectedPatientId) {
        matched = patients.find((p) => p.id === selectedPatientId);
      } else if (mode === "new") {
        matched = null; // Will create new
      }

      const patientLabel = matched ? `${matched.initials} — Leito ${matched.bed}` : parsed.initials ? `${parsed.initials} (novo paciente)` : "Novo paciente";

      setMessages((prev) => [...prev, {
        type: "ai",
        text: `Dados extraídos!\n\nPaciente: ${patientLabel}${parsed.mainDiagnosis ? `\nDiagnóstico: ${parsed.mainDiagnosis}` : ""}${parsed.clinicalCondition ? `\nCondição: ${parsed.clinicalCondition}` : ""}${parsed.vitalSigns?.pa ? `\nSV: PA ${parsed.vitalSigns.pa} | FC ${parsed.vitalSigns.fc} | T ${parsed.vitalSigns.temp}°C | Sat ${parsed.vitalSigns.sato2}%` : ""}`,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        extracted: parsed, matched, isNew: mode === "new",
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, { type: "error", text: "Erro ao processar. Tente novamente.", time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]);
    } finally { setProcessing(false); }
  };

  const handleSave = (msgData) => {
    const parsed = msgData.extracted;
    const now = new Date(); const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const lastUserMsg = messages.filter((m) => m.type === "user").pop()?.text || "";

    const newReport = {
      id: Date.now(), date: dateStr, time: timeStr, author: "Médico(a)", transcription: lastUserMsg,
      devices: parsed.devices || { tot: { active: false, details: "" }, sondaVesical: { active: false, details: "" }, acessoVenoso: { active: false, details: "" }, sng: { active: false, details: "" }, sne: { active: false, details: "" }, dva: { active: false, details: "" } },
      ventilation: parsed.ventilation || { mode: "—", fio2: "—", peep: "—" },
      sedation: parsed.sedation || { drugs: "—", rass: "—" },
      antibiotics: parsed.antibiotics || "Não informado", hemodynamics: parsed.hemodynamics || "Não informado",
      clinicalCondition: parsed.clinicalCondition || "Não informado", diuresis: parsed.diuresis || "Não informado",
      vitalSigns: parsed.vitalSigns || null,
    };
    const newVitals = parsed.vitalSigns ? { date: dateStr, time: timeStr, pa: parsed.vitalSigns.pa || "—", fc: parsed.vitalSigns.fc || 0, temp: parsed.vitalSigns.temp || 0, sato2: parsed.vitalSigns.sato2 || 0, author: "Médico(a)" } : null;
    const patientUpdates = {};
    if (parsed.mainDiagnosis) patientUpdates.mainDiagnosis = parsed.mainDiagnosis;
    if (parsed.admissionReason) patientUpdates.admissionReason = parsed.admissionReason;
    if (parsed.clinicalCondition) patientUpdates.clinicalStatus = parsed.clinicalCondition;
    if (parsed.gender) patientUpdates.gender = parsed.gender;

    if (msgData.matched) {
      onSaveReport({ report: newReport, vitals: newVitals, patientUpdates, patientId: msgData.matched.id });
      setMessages((prev) => [...prev, { type: "saved", text: `Laudo salvo — ${msgData.matched.initials} Leito ${msgData.matched.bed}`, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]);
    } else {
      // Create new patient
      onCreatePatient({ report: newReport, vitals: newVitals, extracted: parsed });
      setMessages((prev) => [...prev, { type: "saved", text: `Novo paciente cadastrado — ${parsed.initials || "N/I"} Leito ${parsed.bed || "?"}`, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]);
    }
  };

  const Bubble = ({ msg, idx }) => {
    if (msg.type === "user") return (
      <div key={idx} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <div style={{ maxWidth: "80%", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", borderRadius: "18px 18px 4px 18px", padding: "14px 18px", color: "white", fontSize: 14, lineHeight: 1.6, boxShadow: "0 2px 10px rgba(14,165,233,0.2)" }}>
          {msg.text}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 6, textAlign: "right" }}>{msg.time}</div>
        </div>
      </div>
    );
    if (msg.type === "ai") return (
      <div key={idx} style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
        <div style={{ maxWidth: "85%" }}>
          <div style={{ background: "white", borderRadius: "18px 18px 18px 4px", padding: "16px 20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>IA • Dados Extraídos</span>
            </div>
            <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-line" }}>{msg.text}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>{msg.time}</div>
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={() => handleSave(msg)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 10px rgba(22,163,74,0.25)", display: "flex", alignItems: "center", gap: 6 }}>
              ✓ {msg.matched ? `Salvar — ${msg.matched.initials} Leito ${msg.matched.bed}` : `Cadastrar novo paciente`}
            </button>
          </div>
        </div>
      </div>
    );
    if (msg.type === "saved") return (
      <div key={idx} style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "10px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>{msg.text}</span>
          <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 8 }}>{msg.time}</span>
        </div>
      </div>
    );
    if (msg.type === "error") return (
      <div key={idx} style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "10px 20px", fontSize: 13, color: "#dc2626" }}>{msg.text}</div>
      </div>
    );
    return (
      <div key={idx} style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "8px 16px", fontSize: 12, color: "#64748b", maxWidth: "80%", textAlign: "center" }}>
          {msg.text}<div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{msg.time}</div>
        </div>
      </div>
    );
  };

  // ── MODE SELECTOR ──
  if (!mode) return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #16a34a, #22c55e)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 6px 20px rgba(22,163,74,0.25)", marginBottom: 16 }}>🎙️</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Novo Laudo por Áudio</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Selecione o tipo de registro para começar</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Existing patient */}
        <div onClick={() => setMode("existing")} style={{
          background: "white", borderRadius: 18, padding: "28px 24px", border: "2px solid #e2e8f0",
          cursor: "pointer", transition: "all 0.2s", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(14,165,233,0.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛏️</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Paciente Existente</div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>Atualizar laudo de um paciente já cadastrado na UTI</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0ea5e9", background: "rgba(14,165,233,0.08)", padding: "6px 14px", borderRadius: 8 }}>{patients.length} pacientes internados</span>
        </div>

        {/* New patient */}
        <div onClick={() => setMode("new")} style={{
          background: "white", borderRadius: 18, padding: "28px 24px", border: "2px solid #e2e8f0",
          cursor: "pointer", transition: "all 0.2s", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#16a34a"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(22,163,74,0.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #16a34a, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>➕</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Novo Paciente</div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>Cadastrar novo paciente via áudio — a IA cria o registro</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", background: "rgba(22,163,74,0.08)", padding: "6px 14px", borderRadius: 8 }}>Admissão rápida</span>
        </div>
      </div>
    </div>
  );

  // ── PATIENT SELECTOR (for existing) ──
  if (mode === "existing" && !selectedPatientId) return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setMode(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>← Voltar</button>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Selecione o paciente</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {patients.map((p) => {
          const days = getDays(p.admissionDate);
          const lastR = p.reports[0];
          return (
            <div key={p.id} onClick={() => setSelectedPatientId(p.id)} style={{
              background: "white", borderRadius: 12, padding: "14px 18px", border: "2px solid #e2e8f0",
              cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0ea5e9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0c4a6e", background: "#e0f2fe", padding: "6px 12px", borderRadius: 8 }}>{p.bed}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{p.initials} — {p.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: `${dayColor(days)}15`, color: dayColor(days) }}>D{days}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{p.mainDiagnosis}</div>
                  {lastR && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Último laudo: {lastR.date} às {lastR.time}</div>}
                </div>
              </div>
              <span style={{ color: "#0ea5e9", fontSize: 18 }}>→</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── CHAT VIEW ──
  const selectedP = selectedPatientId ? patients.find((p) => p.id === selectedPatientId) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 48px)", maxWidth: 780, margin: "0 auto" }}>
      {/* Chat header */}
      <div style={{ padding: "14px 24px", background: "white", borderRadius: "16px 16px 0 0", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={() => { if (mode === "existing") setSelectedPatientId(null); else setMode(null); setMessages([]); setTranscription(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#64748b", padding: "4px 8px" }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: mode === "new" ? "linear-gradient(135deg, #16a34a, #22c55e)" : "linear-gradient(135deg, #0ea5e9, #0284c7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {mode === "new" ? "➕" : "🎙️"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            {mode === "new" ? "Novo Paciente — Admissão por Áudio" : `Laudo — ${selectedP?.initials} • Leito ${selectedP?.bed}`}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {mode === "new" ? "A IA cadastra o paciente automaticamente" : selectedP?.mainDiagnosis}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", background: "linear-gradient(180deg, #f8fafc, #f1f5f9)", display: "flex", flexDirection: "column" }}>
        {messages.length === 0 && !recording && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: 0.6 }}>
            <span style={{ fontSize: 44 }}>{mode === "new" ? "➕" : "🎙️"}</span>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                {mode === "new" ? "Dite os dados do novo paciente" : "Grave o laudo do paciente"}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", maxWidth: 380, lineHeight: 1.5 }}>
                {mode === "new"
                  ? "Inclua: iniciais, sexo, leito, data de internação, motivo, diagnóstico, dispositivos e sinais vitais."
                  : "Fale naturalmente. A IA identifica dispositivos, sinais vitais, sedação, ventilação e antibióticos."}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => <Bubble key={i} msg={msg} idx={i} />)}

        {recording && transcription && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <div style={{ maxWidth: "80%", background: "rgba(14,165,233,0.08)", borderRadius: "18px 18px 4px 18px", padding: "14px 18px", border: "2px dashed #0ea5e9", fontSize: 14, color: "#0c4a6e", lineHeight: 1.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, color: "#0ea5e9", fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", animation: "pulse 1s infinite" }} /> Transcrevendo...
              </div>
              {transcription}
            </div>
          </div>
        )}

        {processing && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div style={{ background: "white", borderRadius: "18px 18px 18px 4px", padding: "16px 20px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, animation: "pulse 1.2s infinite" }}>🤖</span>
              <span style={{ fontSize: 13, color: "#64748b" }}>Processando</span>
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#7c3aed", animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: "14px 24px", background: "white", borderRadius: "0 0 16px 16px", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
        {error && <div style={{ marginBottom: 10, padding: "8px 14px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 12, color: "#dc2626" }}>{error}</div>}
        {recording && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 14px", background: "rgba(239,68,68,0.04)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.1)" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#dc2626", animation: "pulse 1s infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>Gravando — {fmt(seconds)}</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>{[...Array(5)].map((_, i) => <div key={i} style={{ width: 3, background: "#ef4444", borderRadius: 2, animation: `wave 0.8s ease-in-out ${i * 0.08}s infinite alternate`, height: `${8 + Math.random() * 14}px` }} />)}</div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea value={transcription} onChange={(e) => setTranscription(e.target.value)} placeholder={recording ? "Transcrevendo..." : "Digite ou grave o laudo..."} rows={transcription.length > 120 ? 4 : 2} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: `2px solid ${recording ? "#0ea5e9" : "#e2e8f0"}`, fontSize: 14, lineHeight: 1.5, resize: "none", outline: "none", fontFamily: "inherit", background: recording ? "#f0f9ff" : "white", transition: "all 0.2s" }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !recording) { e.preventDefault(); handleSend(); } }} />
          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: "none" }} />
          <button onClick={() => fileInputRef.current?.click()} title="Enviar áudio" style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid #e2e8f0", background: "white", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>📎</button>
          <button onClick={recording ? stopRecording : startRecording} disabled={!speechAvailable} style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: !speechAvailable ? "#e2e8f0" : recording ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #0ea5e9, #0284c7)", fontSize: 16, cursor: speechAvailable ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", color: "white", animation: recording ? "pulse 1.5s infinite" : "none" }}>{recording ? "⏹" : "🎙"}</button>
          <button onClick={handleSend} disabled={!transcription.trim() || recording || processing} style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: transcription.trim() && !recording && !processing ? "linear-gradient(135deg, #16a34a, #15803d)" : "#e2e8f0", fontSize: 16, cursor: transcription.trim() && !recording && !processing ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", color: transcription.trim() && !recording && !processing ? "white" : "#94a3b8" }}>➤</button>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
          <span>Enter envia • Shift+Enter nova linha</span>
          <span>{transcription.length > 0 ? `${transcription.length} chars` : ""}</span>
        </div>
      </div>
    </div>
  );
}

function NewReportFlow({ patient, onSaveReport }) {
  const [step, setStep] = useState("record"); // record | processing | preview | saved
  const [transcription, setTranscription] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [authorName, setAuthorName] = useState("");
  const recognitionRef = useRef(null);
  const intervalRef = useRef(null);
  const textAreaRef = useRef(null);

  // Speech Recognition setup
  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const speechAvailable = !!SpeechRecognition;

  const startRecording = () => {
    if (!speechAvailable) return;
    setError(null);
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = transcription;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + t;
        } else {
          interim = t;
        }
      }
      setTranscription(finalTranscript + (interim ? " " + interim : ""));
    };

    recognition.onerror = (e) => {
      if (e.error === "no-speech") return;
      console.error("Speech error:", e.error);
      setError(`Erro no reconhecimento: ${e.error}`);
    };

    recognition.onend = () => {
      // Auto-restart if still recording
      if (recognitionRef.current && recording) {
        try { recognition.start(); } catch(e) {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setRecording(true);
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch(e) {
      setError("Não foi possível iniciar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => () => { stopRecording(); clearInterval(intervalRef.current); }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Process with Claude API
  const processWithAI = async () => {
    if (!transcription.trim()) { setError("Insira ou grave uma transcrição primeiro."); return; }
    setProcessing(true);
    setError(null);
    setStep("processing");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: AI_SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Transcrição do áudio médico:\n\n"${transcription.trim()}"` }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setExtractedData(parsed);
      setStep("preview");
    } catch (err) {
      console.error("AI processing error:", err);
      setError("Erro ao processar com IA. Tente novamente.");
      setStep("record");
    } finally {
      setProcessing(false);
    }
  };

  // Save report
  const handleSave = () => {
    if (!extractedData) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newReport = {
      id: Date.now(),
      date: dateStr,
      time: timeStr,
      author: authorName || "Médico(a)",
      transcription: transcription.trim(),
      devices: extractedData.devices || { tot: { active: false, details: "" }, sondaVesical: { active: false, details: "" }, acessoVenoso: { active: false, details: "" }, sng: { active: false, details: "" }, sne: { active: false, details: "" }, dva: { active: false, details: "" } },
      ventilation: extractedData.ventilation || { mode: "—", fio2: "—", peep: "—" },
      sedation: extractedData.sedation || { drugs: "—", rass: "—" },
      antibiotics: extractedData.antibiotics || "Não informado",
      hemodynamics: extractedData.hemodynamics || "Não informado",
      clinicalCondition: extractedData.clinicalCondition || "Não informado",
      diuresis: extractedData.diuresis || "Não informado",
      vitalSigns: extractedData.vitalSigns || null,
    };

    const newVitals = extractedData.vitalSigns ? {
      date: dateStr, time: timeStr,
      pa: extractedData.vitalSigns.pa || "—",
      fc: extractedData.vitalSigns.fc || 0,
      temp: extractedData.vitalSigns.temp || 0,
      sato2: extractedData.vitalSigns.sato2 || 0,
      author: authorName || "Médico(a)",
    } : null;

    const patientUpdates = {};
    if (extractedData.mainDiagnosis) patientUpdates.mainDiagnosis = extractedData.mainDiagnosis;
    if (extractedData.admissionReason) patientUpdates.admissionReason = extractedData.admissionReason;
    if (extractedData.clinicalCondition) patientUpdates.clinicalStatus = extractedData.clinicalCondition;
    if (extractedData.gender) patientUpdates.gender = extractedData.gender;
    if (extractedData.admissionDate) patientUpdates.admissionDate = extractedData.admissionDate;

    onSaveReport({ report: newReport, vitals: newVitals, patientUpdates });
    setStep("saved");
  };

  const reset = () => { setStep("record"); setTranscription(""); setExtractedData(null); setError(null); setAuthorName(""); };

  // Field display helper
  const Field = ({ label, value, color = "#0ea5e9" }) => value && value !== "null" && value !== null ? (
    <div style={{ background: `${color}08`, border: `1px solid ${color}18`, borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{typeof value === "object" ? JSON.stringify(value) : String(value)}</div>
    </div>
  ) : null;

  const DevicePill = ({ name, device }) => device ? (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 12, background: device.active ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)", border: `1px solid ${device.active ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"}` }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: device.active ? "#dc2626" : "#22c55e" }} />
      <span style={{ fontWeight: 600, color: "#334155" }}>{name}</span>
      {device.details && <span style={{ color: "#64748b", fontSize: 11 }}>— {device.details}</span>}
    </div>
  ) : null;

  // ── STEP: RECORD ──
  if (step === "record") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.3s ease" }}>
      {/* Author */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#0c4a6e", display: "block", marginBottom: 6 }}>Nome do profissional:</label>
        <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Ex: Dr. Carlos Mendonça" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
      </div>

      {/* Recorder */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", background: recording ? "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))" : "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: 14, border: `1px solid ${recording ? "rgba(239,68,68,0.2)" : "#e2e8f0"}` }}>
        <button onClick={recording ? stopRecording : startRecording} disabled={!speechAvailable} style={{ width: 56, height: 56, borderRadius: "50%", border: "none", background: !speechAvailable ? "#94a3b8" : recording ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "white", fontSize: 22, cursor: speechAvailable ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: recording ? "0 0 24px rgba(239,68,68,0.35)" : "0 4px 14px rgba(14,165,233,0.3)", animation: recording ? "pulse 1.5s infinite" : "none", flexShrink: 0 }}>{recording ? "⏹" : "🎙"}</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{recording ? "Gravando..." : speechAvailable ? "Gravar laudo por voz" : "Microfone indisponível"}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{recording ? `${fmt(seconds)} — Fale os dados do paciente` : speechAvailable ? "Toque para iniciar • Reconhecimento pt-BR" : "Use a caixa de texto abaixo"}</div>
        </div>
        {recording && <div style={{ display: "flex", gap: 3, alignItems: "center", height: 28 }}>{[...Array(7)].map((_, i) => <div key={i} style={{ width: 3, background: "#ef4444", borderRadius: 2, animation: `wave 0.8s ease-in-out ${i * 0.08}s infinite alternate`, height: `${10 + Math.random() * 16}px` }} />)}</div>}
      </div>

      {/* Transcription area */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#0c4a6e" }}>Transcrição {recording && <span style={{ color: "#dc2626", fontWeight: 400 }}>(atualizando em tempo real...)</span>}</label>
          {transcription && <button onClick={() => setTranscription("")} style={{ fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Limpar</button>}
        </div>
        <textarea ref={textAreaRef} value={transcription} onChange={(e) => setTranscription(e.target.value)} placeholder="A transcrição aparecerá aqui automaticamente durante a gravação, ou cole/digite o texto manualmente..." rows={8} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${recording ? "#0ea5e9" : "#e2e8f0"}`, fontSize: 14, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border 0.2s", background: recording ? "#f0f9ff" : "white" }} />
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "right" }}>{transcription.length} caracteres</div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>{error}</div>}

      {/* Process button */}
      <button onClick={processWithAI} disabled={!transcription.trim() || recording} style={{
        padding: "14px 24px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, cursor: transcription.trim() && !recording ? "pointer" : "not-allowed",
        background: transcription.trim() && !recording ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "#e2e8f0",
        color: transcription.trim() && !recording ? "white" : "#94a3b8",
        boxShadow: transcription.trim() && !recording ? "0 4px 16px rgba(14,165,233,0.3)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", transition: "all 0.2s",
      }}>
        <span style={{ fontSize: 18 }}>🤖</span> Processar com IA — Extrair Dados Estruturados
      </button>

      {/* Help */}
      <div style={{ fontSize: 12, color: "#64748b", padding: "14px 16px", background: "#f8fafc", borderRadius: 10, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, color: "#0c4a6e", marginBottom: 6, fontSize: 13 }}>Dica de uso:</div>
        Fale naturalmente, como se estivesse ditando o laudo. A IA identifica automaticamente: identificação do paciente, diagnóstico, motivo da internação, dispositivos, sinais vitais, sedação, ventilação, antibióticos e condição clínica. Não é necessário seguir um roteiro fixo.
      </div>
    </div>
  );

  // ── STEP: PROCESSING ──
  if (step === "processing") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 20, animation: "fadeIn 0.3s ease" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, animation: "pulse 1.2s infinite" }}>🤖</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Processando com IA...</div>
        <div style={{ fontSize: 14, color: "#64748b" }}>Extraindo dados estruturados da transcrição</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#0ea5e9", animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />)}
      </div>
    </div>
  );

  // ── STEP: PREVIEW ──
  if (step === "preview" && extractedData) {
    const d = extractedData;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.3s ease" }}>
        {/* Success banner */}
        <div style={{ background: "linear-gradient(90deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>Dados extraídos com sucesso</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Revise os dados abaixo antes de salvar. Paciente: {patient.initials} — Leito {patient.bed}</div>
          </div>
        </div>

        {/* Transcription reference */}
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, fontSize: 13, color: "#334155", lineHeight: 1.6, borderLeft: "3px solid #0ea5e9", maxHeight: 120, overflow: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#0ea5e9", marginBottom: 4 }}>🎙️ Transcrição original</div>
          {transcription}
        </div>

        {/* Extracted: Patient Info */}
        <div style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#0c4a6e", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 14, background: "#0ea5e9", borderRadius: 2, display: "inline-block" }} />
            Identificação e Diagnóstico
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            <Field label="Sexo" value={d.gender === "F" ? "Feminino" : d.gender === "M" ? "Masculino" : null} color="#db2777" />
            <Field label="Iniciais" value={d.initials} color="#0c4a6e" />
            <Field label="Data Internação" value={d.admissionDate} color="#7c3aed" />
            <Field label="Motivo Internação" value={d.admissionReason} color="#7c3aed" />
            <Field label="Diagnóstico Principal" value={d.mainDiagnosis} color="#0c4a6e" />
            <Field label="Condição Clínica" value={d.clinicalCondition} color="#dc2626" />
          </div>
        </div>

        {/* Extracted: Vitals */}
        {d.vitalSigns && (
          <div style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#dc2626", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 14, background: "#dc2626", borderRadius: 2, display: "inline-block" }} />
              Sinais Vitais Extraídos
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
              <VitalCard icon="🩸" label="PA" value={d.vitalSigns.pa || "—"} unit="mmHg" color="#dc2626" />
              <VitalCard icon="💓" label="FC" value={d.vitalSigns.fc || "—"} unit="bpm" color="#ea580c" alert={d.vitalSigns.fc > 100} />
              <VitalCard icon="🌡️" label="Temp" value={d.vitalSigns.temp ? d.vitalSigns.temp.toFixed(1) : "—"} unit="°C" color="#f59e0b" alert={d.vitalSigns.temp >= 37.8} />
              <VitalCard icon="💨" label="SatO₂" value={d.vitalSigns.sato2 || "—"} unit="%" color="#16a34a" alert={d.vitalSigns.sato2 && d.vitalSigns.sato2 < 95} />
            </div>
          </div>
        )}

        {/* Extracted: Devices */}
        {d.devices && (
          <div style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#0ea5e9", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 14, background: "#0ea5e9", borderRadius: 2, display: "inline-block" }} />
              Dispositivos
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <DevicePill name="TOT" device={d.devices.tot} />
              <DevicePill name="SVD" device={d.devices.sondaVesical} />
              <DevicePill name="CVC" device={d.devices.acessoVenoso} />
              <DevicePill name="SNG" device={d.devices.sng} />
              <DevicePill name="SNE" device={d.devices.sne} />
              <DevicePill name="DVA" device={d.devices.dva} />
            </div>
          </div>
        )}

        {/* Extracted: Clinical */}
        <div style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#7c3aed", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 14, background: "#7c3aed", borderRadius: 2, display: "inline-block" }} />
            Dados Clínicos
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            <Field label="Ventilação" value={d.ventilation ? `${d.ventilation.mode || "—"} | FiO₂ ${d.ventilation.fio2 || "—"} | PEEP ${d.ventilation.peep || "—"}` : null} color="#7c3aed" />
            <Field label="Sedação" value={d.sedation ? `${d.sedation.drugs || "—"} | RASS ${d.sedation.rass || "—"}` : null} color="#0ea5e9" />
            <Field label="Antibióticos" value={d.antibiotics} color="#ea580c" />
            <Field label="Hemodinâmica" value={d.hemodynamics} color="#16a34a" />
            <Field label="Diurese" value={d.diuresis} color="#8b5cf6" />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setStep("record")} style={{ flex: 1, padding: "14px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            ← Voltar e editar transcrição
          </button>
          <button onClick={handleSave} style={{ flex: 2, padding: "14px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(22,163,74,0.3)" }}>
            <span style={{ fontSize: 18 }}>✓</span> Confirmar e Salvar Laudo
          </button>
        </div>
      </div>
    );
  }

  // ── STEP: SAVED ──
  if (step === "saved") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 20, animation: "fadeIn 0.3s ease" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 0 30px rgba(22,163,74,0.3)" }}>✓</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Laudo Salvo com Sucesso!</div>
        <div style={{ fontSize: 14, color: "#64748b" }}>Os dados foram registrados para {patient.initials} — Leito {patient.bed}</div>
      </div>
      <button onClick={reset} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.3)", display: "flex", alignItems: "center", gap: 8 }}>
        <span>🎙</span> Registrar Novo Laudo
      </button>
    </div>
  );

  return null;
}

// ═══════════════════════════════════════════════════════════
// MANAGER DASHBOARD
// ═══════════════════════════════════════════════════════════

function ManagerDashboard({ patients, onSelectPatient }) {
  const totalPatients = patients.length;
  const avgDays = Math.round(patients.reduce((a, p) => a + getDays(p.admissionDate), 0) / totalPatients);
  const maxDays = Math.max(...patients.map((p) => getDays(p.admissionDate)));
  const longestPatient = patients.find((p) => getDays(p.admissionDate) === maxDays);

  // Device counts
  const devCount = (key) => patients.filter((p) => p.reports[0]?.devices[key]?.active).length;
  const totCount = devCount("tot");
  const svcCount = devCount("sondaVesical");
  const cvcCount = devCount("acessoVenoso");
  const dvaCount = devCount("dva");
  const sngCount = devCount("sng");
  const sneCount = devCount("sne");

  // Clinical conditions
  const inShock = patients.filter((p) => p.clinicalStatus.toLowerCase().includes("choque")).length;
  const inDesmame = patients.filter((p) => p.clinicalStatus.toLowerCase().includes("desmame")).length;
  const stable = patients.filter((p) => p.clinicalStatus.toLowerCase().includes("estável")).length;
  const onVM = patients.filter((p) => {
    const m = p.reports[0]?.ventilation?.mode;
    return m && m !== "Ar ambiente";
  }).length;

  // Gender
  const femaleCount = patients.filter((p) => p.gender === "F").length;

  // Alerts
  const alerts = [];
  patients.forEach((p) => {
    const d = getDays(p.admissionDate);
    if (d > 14) alerts.push({ type: "warning", text: `${p.initials} (Leito ${p.bed}) — ${d} dias de internação`, patient: p });
    const v = p.vitals[0];
    if (v && v.temp >= 38) alerts.push({ type: "danger", text: `${p.initials} (Leito ${p.bed}) — Febre ${v.temp.toFixed(1)}°C`, patient: p });
    if (v && v.sato2 < 95) alerts.push({ type: "danger", text: `${p.initials} (Leito ${p.bed}) — SatO₂ baixa ${v.sato2}%`, patient: p });
    if (v && v.fc > 120) alerts.push({ type: "danger", text: `${p.initials} (Leito ${p.bed}) — Taquicardia ${v.fc} bpm`, patient: p });
    if (p.clinicalStatus.toLowerCase().includes("choque")) alerts.push({ type: "danger", text: `${p.initials} (Leito ${p.bed}) — ${p.clinicalStatus}`, patient: p });
  });

  const KPI = ({ icon, value, label, sub, color }) => (
    <div style={{ background: "white", borderRadius: 16, padding: "20px 22px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -8, right: -8, fontSize: 48, opacity: 0.06 }}>{icon}</div>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: color || "#0f172a", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Dashboard — UTI HUSE</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Visão gerencial em tempo real • {new Date(TODAY + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 28 }}>
        <KPI icon="🛏️" value={totalPatients} label="Pacientes Internados" sub={`${femaleCount}F / ${totalPatients - femaleCount}M`} color="#0c4a6e" />
        <KPI icon="📅" value={`${avgDays}d`} label="Tempo Médio Internação" sub={`Máx: ${maxDays}d (${longestPatient?.initials})`} color={dayColor(avgDays)} />
        <KPI icon="🫁" value={onVM} label="Em Ventilação Mecânica" sub={`de ${totalPatients} pacientes`} color="#7c3aed" />
        <KPI icon="❤️" value={dvaCount} label="Em Droga Vasoativa" sub={`${inShock} em choque, ${inDesmame} em desmame`} color="#dc2626" />
      </div>

      {/* Two columns: Devices + Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Devices */}
        <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 18, background: "linear-gradient(to bottom, #0ea5e9, #7c3aed)", borderRadius: 2, display: "inline-block" }} />
            Dispositivos em Uso
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "Tubo Orotraqueal (TOT)", count: totCount, icon: "🫁", color: "#7c3aed" },
              { name: "Acesso Venoso Central", count: cvcCount, icon: "💉", color: "#0ea5e9" },
              { name: "Sonda Vesical de Demora", count: svcCount, icon: "💧", color: "#f59e0b" },
              { name: "Droga Vasoativa", count: dvaCount, icon: "❤️", color: "#dc2626" },
              { name: "Sonda Nasogástrica", count: sngCount, icon: "🍽️", color: "#ea580c" },
              { name: "Sonda Nasoentérica", count: sneCount, icon: "🥤", color: "#16a34a" },
            ].map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{d.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: d.color }}>{d.count}/{totalPatients}</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(d.count / totalPatients) * 100}%`, background: `linear-gradient(90deg, ${d.color}aa, ${d.color})`, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 18, background: "linear-gradient(to bottom, #dc2626, #f97316)", borderRadius: 2, display: "inline-block" }} />
            Alertas e Atenções
            <span style={{ fontSize: 11, background: "rgba(239,68,68,0.1)", color: "#dc2626", padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>{alerts.length}</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
            {alerts.length === 0 ? (
              <div style={{ color: "#16a34a", fontSize: 14, fontWeight: 600, textAlign: "center", padding: 30 }}>✓ Nenhum alerta no momento</div>
            ) : alerts.map((a, i) => (
              <div key={i} onClick={() => onSelectPatient(a.patient)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                background: a.type === "danger" ? "rgba(239,68,68,0.05)" : "rgba(234,179,8,0.05)",
                border: `1px solid ${a.type === "danger" ? "rgba(239,68,68,0.12)" : "rgba(234,179,8,0.15)"}`,
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 10, width: 8, height: 8, borderRadius: "50%", background: a.type === "danger" ? "#dc2626" : "#eab308", flexShrink: 0, boxShadow: `0 0 6px ${a.type === "danger" ? "rgba(239,68,68,0.5)" : "rgba(234,179,8,0.5)"}` }} />
                <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{a.text}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Grid */}
      <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 4, height: 18, background: "linear-gradient(to bottom, #0ea5e9, #7c3aed)", borderRadius: 2, display: "inline-block" }} />
          Mapa de Leitos — Resumo por Paciente
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {patients.map((p) => {
            const days = getDays(p.admissionDate);
            const v = p.vitals[0];
            const lr = p.reports[0];
            const dvaActive = lr?.devices.dva.active;
            const totActive = lr?.devices.tot.active;
            return (
              <div key={p.id} onClick={() => onSelectPatient(p)} style={{
                background: "linear-gradient(135deg, #f8fafc, #ffffff)", borderRadius: 14, padding: "18px 20px",
                border: `1px solid ${dvaActive ? "rgba(239,68,68,0.2)" : "#e2e8f0"}`,
                cursor: "pointer", transition: "all 0.2s", position: "relative",
                boxShadow: dvaActive ? "0 0 12px rgba(239,68,68,0.06)" : "0 2px 6px rgba(0,0,0,0.02)",
              }}>
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#0c4a6e", background: "#e0f2fe", padding: "4px 10px", borderRadius: 8 }}>
                      {p.bed}
                    </span>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{p.initials}</span>
                    <GenderBadge gender={p.gender} />
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 8,
                    background: `${dayColor(days)}15`, color: dayColor(days), border: `1px solid ${dayColor(days)}25`,
                  }}>D{days}</span>
                </div>

                {/* Diagnosis */}
                <div style={{ fontSize: 12, color: "#334155", fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{p.mainDiagnosis}</div>

                {/* Status */}
                <div style={{
                  fontSize: 11, fontWeight: 700, color: p.clinicalStatus.toLowerCase().includes("choque") ? "#dc2626" : p.clinicalStatus.toLowerCase().includes("desmame") ? "#ea580c" : "#16a34a",
                  marginBottom: 10,
                }}>{p.clinicalStatus}</div>

                {/* Mini vitals row */}
                {v && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { label: "PA", val: v.pa, color: "#334155" },
                      { label: "FC", val: v.fc, color: v.fc > 100 ? "#ea580c" : "#334155" },
                      { label: "T", val: v.temp.toFixed(1) + "°", color: v.temp >= 37.8 ? "#dc2626" : "#334155" },
                      { label: "Sat", val: v.sato2 + "%", color: v.sato2 < 95 ? "#dc2626" : "#16a34a" },
                    ].map((item) => (
                      <span key={item.label} style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>
                        {item.label} <strong style={{ color: item.color }}>{item.val}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {/* Device pills */}
                <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                  {totActive && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "rgba(124,58,237,0.08)", color: "#7c3aed", fontWeight: 700 }}>TOT</span>}
                  {lr?.devices.acessoVenoso.active && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "rgba(14,165,233,0.08)", color: "#0ea5e9", fontWeight: 700 }}>CVC</span>}
                  {lr?.devices.sondaVesical.active && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "rgba(245,158,11,0.08)", color: "#f59e0b", fontWeight: 700 }}>SVD</span>}
                  {dvaActive && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "rgba(239,68,68,0.08)", color: "#dc2626", fontWeight: 700 }}>DVA</span>}
                  {lr?.devices.sng.active && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "rgba(234,88,12,0.08)", color: "#ea580c", fontWeight: 700 }}>SNG</span>}
                  {lr?.devices.sne.active && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "rgba(22,163,74,0.08)", color: "#16a34a", fontWeight: 700 }}>SNE</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PATIENT VIEW (individual)
// ═══════════════════════════════════════════════════════════

function PatientView({ patient, onAddReport }) {
  const [activeTab, setActiveTab] = useState("overview");
  const latestReport = patient.reports[0];
  const latestVitals = patient.vitals[0];
  const cl = patient.checklist;

  const checklistSections = [
    { title: "Analgesia e Sedação", items: [{ label: "Sem dor / sedação adequada?", value: cl.analgesiaSedacao.semDor }, { label: "Diminuir/interromper sedação?", value: cl.analgesiaSedacao.diminuirSedacao }, { label: "Sedação por meta (RASS)?", value: cl.analgesiaSedacao.sedacaoMeta }, { label: "Contenção?", value: cl.analgesiaSedacao.contencao }, { label: "Agitação tratada?", value: cl.analgesiaSedacao.agitacao }] },
    { title: "Dieta", items: [{ label: "Dieta adequada?", value: cl.dieta.adequada }, { label: "Jejum >12h?", value: cl.dieta.jejum12h }] },
    { title: "Prev. Complicações", items: [{ label: "Profilaxia úlcera stress?", value: cl.prevComplicacoes.profilaxiaUlcera }, { label: "Profilaxia TVP?", value: cl.prevComplicacoes.profilaxiaTVP }, { label: "Controle glicêmico?", value: cl.prevComplicacoes.controleGlicemico }] },
    { title: "Prev. Pneumonia", items: [{ label: "Proteção ventilatória?", value: cl.prevPneumonia.protecaoVentilatoria }, { label: "Critério TRE?", value: cl.prevPneumonia.criterioTRE }, { label: "Possível extubação?", value: cl.prevPneumonia.extubacao }] },
    { title: "Prev. IPCS/ITU", items: [{ label: "SVD pode remover?", value: cl.prevIPCS.svdRemover }, { label: "CVC pode remover?", value: cl.prevIPCS.cvcRemover }] },
    { title: "Antibióticos", items: [{ label: "Dose/tempo corretos?", value: cl.antibioticos.doseCorreta }, { label: "Descalonar?", value: cl.antibioticos.descalonar }] },
    { title: "Exames", items: [{ label: "Culturas solicitadas?", value: cl.exames.culturas }, { label: "Exames pendentes?", value: cl.exames.examesPendentes }, { label: "Procedimentos?", value: cl.exames.procedimentos }, { label: "Especialista?", value: cl.exames.especialista }] },
    { title: "Planejamento", items: [{ label: "Planejamento feito?", value: cl.planejamento.feito }, { label: "Metas alcançadas?", value: cl.planejamento.metasAlcancadas }, { label: "Revisão necessária?", value: cl.planejamento.revisao }] },
    { title: "Conformidades", items: [{ label: "Pulseira ID?", value: cl.conformidades.pulseira }, { label: "Cabeceira 30-45°?", value: cl.conformidades.cabeceira }, { label: "Filtro barreira datado?", value: cl.conformidades.filtroBarreira }, { label: "Curativo CVC datado?", value: cl.conformidades.curativoCVC }, { label: "Equipos datados?", value: cl.conformidades.equipamentos }, { label: "SVD fixada?", value: cl.conformidades.svdFixada }, { label: "Bolsa <1200ml?", value: cl.conformidades.bolsaColetora }] },
  ];

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "vitals", label: "Sinais Vitais", icon: "💓" },
    { id: "timeline", label: "Evolução", icon: "📋" },
    { id: "checklist", label: "Checklist", icon: "✅" },
    { id: "audio", label: "Novo Laudo", icon: "🎙️" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", fontWeight: 700 }}>Leito {patient.bed} • {patient.unit}</span>
            <GenderBadge gender={patient.gender} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>{patient.initials} — {patient.name}</h1>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>Reg: {patient.registration}</span>
            <span>DN: {new Date(patient.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 14, padding: "14px 20px", border: "1px solid #e2e8f0", textAlign: "center", minWidth: 180 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>Tempo de Internação</div>
          <StayDaysBar admissionDate={patient.admissionDate} />
        </div>
      </div>

      {/* Banners */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "linear-gradient(135deg, #0c4a6e, #164e63)", borderRadius: 14, padding: "16px 22px", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22 }}>🩺</span>
          <div><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Diagnóstico</div><div style={{ color: "white", fontWeight: 700, fontSize: 15, marginTop: 2 }}>{patient.mainDiagnosis}</div></div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #581c87, #7e22ce)", borderRadius: 14, padding: "16px 22px", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Motivo da Internação</div><div style={{ color: "white", fontWeight: 700, fontSize: 15, marginTop: 2 }}>{patient.admissionReason}</div></div>
        </div>
      </div>

      {patient.clinicalStatus && (
        <div style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "12px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#dc2626", boxShadow: "0 0 8px rgba(239,68,68,0.5)", animation: "pulse 2s infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>CONDIÇÃO: {patient.clinicalStatus.toUpperCase()}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "white", padding: 4, borderRadius: 12, border: "1px solid #e2e8f0", width: "fit-content", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "10px 18px", borderRadius: 9, border: "none", background: activeTab === tab.id ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "transparent", color: activeTab === tab.id ? "white" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 4, height: 18, background: "linear-gradient(to bottom, #dc2626, #f97316)", borderRadius: 2, display: "inline-block" }} />Sinais Vitais Atuais <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400, marginLeft: 8 }}>{latestVitals.date} {latestVitals.time}</span></h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <VitalCard icon="🩸" label="PA" value={latestVitals.pa} unit="mmHg" color="#dc2626" />
              <VitalCard icon="💓" label="FC" value={latestVitals.fc} unit="bpm" color="#ea580c" alert={latestVitals.fc > 100} />
              <VitalCard icon="🌡️" label="Temp" value={latestVitals.temp.toFixed(1)} unit="°C" color="#f59e0b" alert={latestVitals.temp >= 37.8} />
              <VitalCard icon="💨" label="SatO₂" value={latestVitals.sato2} unit="%" color="#16a34a" alert={latestVitals.sato2 < 95} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 4, height: 18, background: "linear-gradient(to bottom, #0ea5e9, #7c3aed)", borderRadius: 2, display: "inline-block" }} />Dispositivos</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 12 }}>
              <DeviceCard icon="🫁" name="TOT" active={latestReport.devices.tot.active} details={latestReport.devices.tot.details} />
              <DeviceCard icon="💧" name="Sonda Vesical" active={latestReport.devices.sondaVesical.active} details={latestReport.devices.sondaVesical.details} />
              <DeviceCard icon="💉" name="CVC" active={latestReport.devices.acessoVenoso.active} details={latestReport.devices.acessoVenoso.details} />
              <DeviceCard icon="🍽️" name="SNG" active={latestReport.devices.sng.active} details={latestReport.devices.sng.details || "Não instalada"} />
              <DeviceCard icon="🥤" name="SNE" active={latestReport.devices.sne.active} details={latestReport.devices.sne.details || "Não instalada"} />
              <DeviceCard icon="❤️" name="DVA" active={latestReport.devices.dva.active} details={latestReport.devices.dva.details || "Sem DVA"} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
            <div style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#7c3aed", fontWeight: 700, marginBottom: 10 }}>🫁 Ventilação</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{latestReport.ventilation.mode}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 13, color: "#64748b" }}><span>FiO₂ <strong style={{ color: "#0f172a" }}>{latestReport.ventilation.fio2}</strong></span><span>PEEP <strong style={{ color: "#0f172a" }}>{latestReport.ventilation.peep}</strong></span></div>
            </div>
            <div style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#0ea5e9", fontWeight: 700, marginBottom: 10 }}>😴 Sedação</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>RASS {latestReport.sedation.rass}</div>
              <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>{latestReport.sedation.drugs}</div>
            </div>
            <div style={{ background: "white", borderRadius: 14, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#ea580c", fontWeight: 700, marginBottom: 10 }}>💊 ATB</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{latestReport.antibiotics}</div>
              <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>{latestReport.hemodynamics}</div>
            </div>
          </div>
          <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 4, height: 18, background: "linear-gradient(to bottom, #0ea5e9, #7c3aed)", borderRadius: 2, display: "inline-block" }} />Último Laudo — {latestReport.date} {latestReport.time}</h3>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, background: "#f8fafc", padding: 16, borderRadius: 10, borderLeft: "3px solid #0ea5e9" }}>{latestReport.transcription}</div>
          </div>

          {/* ── Reports Summary ── */}
          <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 18, background: "linear-gradient(to bottom, #f59e0b, #ea580c)", borderRadius: 2, display: "inline-block" }} />
                Resumo de Laudos
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  <strong style={{ color: "#0f172a" }}>{patient.reports.length}</strong> laudo{patient.reports.length !== 1 ? "s" : ""} registrado{patient.reports.length !== 1 ? "s" : ""}
                </span>
                <span style={{ width: 1, height: 14, background: "#e2e8f0" }} />
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Último: <strong style={{ color: "#0ea5e9" }}>{latestReport.date} às {latestReport.time}</strong>
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {patient.reports.map((r, idx) => (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 10,
                  background: idx === 0 ? "rgba(14,165,233,0.04)" : "#f8fafc",
                  border: `1px solid ${idx === 0 ? "rgba(14,165,233,0.12)" : "#f1f5f9"}`,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: idx === 0 ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: idx === 0 ? "white" : "#64748b", fontWeight: 700, flexShrink: 0 }}>
                    {idx === 0 ? "🔵" : idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0c4a6e" }}>{r.date}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{r.time}</span>
                      {idx === 0 && <span style={{ fontSize: 9, fontWeight: 700, color: "#0ea5e9", background: "rgba(14,165,233,0.08)", padding: "2px 8px", borderRadius: 4 }}>MAIS RECENTE</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.author} — {r.clinicalCondition || "Sem condição registrada"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {r.vitalSigns && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(22,163,74,0.08)", color: "#16a34a", fontWeight: 600 }}>SSVV</span>}
                    {r.devices?.dva?.active && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.08)", color: "#dc2626", fontWeight: 600 }}>DVA</span>}
                    {r.devices?.tot?.active && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(124,58,237,0.08)", color: "#7c3aed", fontWeight: 600 }}>TOT</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab("timeline")} style={{ marginTop: 14, width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", color: "#0ea5e9", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
              Ver evolução completa →
            </button>
          </div>
        </div>
      )}

      {/* VITALS */}
      {activeTab === "vitals" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { key: "fc", label: "FC", icon: "💓", color: "#ea580c", unit: "bpm", latest: latestVitals.fc },
              { key: "temp", label: "Temp", icon: "🌡️", color: "#f59e0b", unit: "°C", latest: latestVitals.temp.toFixed(1) },
              { key: "sato2", label: "SatO₂", icon: "💨", color: "#16a34a", unit: "%", latest: latestVitals.sato2 },
            ].map((m) => (
              <div key={m.key} style={{ background: "white", borderRadius: 14, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{m.icon} {m.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.latest} <span style={{ fontSize: 11, color: "#94a3b8" }}>{m.unit}</span></span>
                </div>
                <MiniChart data={patient.vitals} dataKey={m.key} color={m.color} height={45} />
              </div>
            ))}
          </div>
          <div style={{ background: "white", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0" }}><VitalsTimeline vitals={patient.vitals} /></div>
        </div>
      )}

      {/* TIMELINE */}
      {activeTab === "timeline" && (
        <div>{patient.reports.map((r, i) => <TimelineItem key={r.id} report={r} isLast={i === patient.reports.length - 1} />)}</div>
      )}

      {/* CHECKLIST */}
      {activeTab === "checklist" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            {checklistSections.map((s) => (
              <div key={s.title} style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #e2e8f0" }}><ChecklistSection title={s.title} items={s.items} /></div>
            ))}
          </div>
          <div style={{ marginTop: 20, background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#0c4a6e", marginBottom: 12 }}>Equipe Multiprofissional</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Diarista", "Plantonista", "Enfermeiro", "Fisioterapeuta", "T. Enfermagem", "Odontólogo", "Psicólogo", "Nutricionista", "Fonoaudiólogo"].map((p) => (
                <span key={p} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "#f0f9ff", color: "#0c4a6e", border: "1px solid #bae6fd" }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AUDIO */}
      {activeTab === "audio" && (
        <div style={{ maxWidth: 740 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 18, background: "linear-gradient(to bottom, #0ea5e9, #7c3aed)", borderRadius: 2, display: "inline-block" }} />
            Registrar Novo Laudo — {patient.initials} • Leito {patient.bed}
          </h3>
          <NewReportFlow patient={patient} onSaveReport={onAddReport} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

export default function ICUDashboard() {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [view, setView] = useState("dashboard"); // "dashboard" | "patient" | "newAudio"
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientsExpanded, setPatientsExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const goToPatient = (p) => { setSelectedPatient(p); setView("patient"); };
  const goToDashboard = () => { setView("dashboard"); setSelectedPatient(null); };
  const goToAudio = () => { setView("newAudio"); };

  // Save from patient view (audio tab inside patient)
  const handleAddReport = ({ report, vitals, patientUpdates }) => {
    const targetId = selectedPatient?.id;
    if (!targetId) return;
    setPatients((prev) => prev.map((p) => {
      if (p.id !== targetId) return p;
      const updated = { ...p, reports: [report, ...p.reports] };
      if (vitals) updated.vitals = [vitals, ...p.vitals];
      if (patientUpdates) Object.assign(updated, patientUpdates);
      return updated;
    }));
    setSelectedPatient((prev) => {
      if (!prev || prev.id !== targetId) return prev;
      const updated = { ...prev, reports: [report, ...prev.reports] };
      if (vitals) updated.vitals = [vitals, ...prev.vitals];
      if (patientUpdates) Object.assign(updated, patientUpdates);
      return updated;
    });
  };

  // Save from standalone audio chat (identifies patient by ID)
  const handleAudioSave = ({ report, vitals, patientUpdates, patientId }) => {
    if (!patientId) return;
    setPatients((prev) => prev.map((p) => {
      if (p.id !== patientId) return p;
      const updated = { ...p, reports: [report, ...p.reports] };
      if (vitals) updated.vitals = [vitals, ...p.vitals];
      if (patientUpdates) Object.assign(updated, patientUpdates);
      return updated;
    }));
  };

  // Create new patient from audio
  const handleCreatePatient = ({ report, vitals, extracted }) => {
    const newPatient = {
      id: Date.now(),
      initials: extracted.initials || "N/I",
      name: extracted.initials ? extracted.initials.split("").join(". ") + "." : "Novo Paciente",
      gender: extracted.gender || "M",
      birthDate: "1970-01-01",
      registration: `UTI-2026-${String(patients.length + 1).padStart(4, "0")}`,
      bed: extracted.bed || String(patients.length + 1).padStart(2, "0"),
      unit: "UTI Adulto",
      admissionDate: extracted.admissionDate || new Date().toISOString().slice(0, 10),
      admissionReason: extracted.admissionReason || "Não informado",
      mainDiagnosis: extracted.mainDiagnosis || "Não informado",
      clinicalStatus: extracted.clinicalCondition || "Não informado",
      vitals: vitals ? [vitals] : [],
      reports: [report],
      checklist: {
        analgesiaSedacao: { semDor: null, diminuirSedacao: null, sedacaoMeta: null, contencao: null, agitacao: null },
        dieta: { adequada: null, jejum12h: null },
        prevComplicacoes: { profilaxiaUlcera: null, profilaxiaTVP: null, controleGlicemico: null },
        prevPneumonia: { protecaoVentilatoria: null, criterioTRE: null, extubacao: null },
        prevIPCS: { svdRemover: null, cvcRemover: null },
        antibioticos: { doseCorreta: null, descalonar: null },
        exames: { culturas: null, examesPendentes: null, procedimentos: null, especialista: null },
        planejamento: { feito: null, metasAlcancadas: null, revisao: null },
        conformidades: { pulseira: null, cabeceira: null, filtroBarreira: null, curativoCVC: null, equipamentos: null, svdFixada: null, bolsaColetora: null },
      },
    };
    setPatients((prev) => [...prev, newPatient]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f9ff 0%, #e8eef5 50%, #f5f0ff 100%)", fontFamily: "'Segoe UI', 'SF Pro Display', -apple-system, sans-serif", display: "flex" }}>
      <style>{`
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes wave{from{height:6px}to{height:22px}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      `}</style>

      {/* ═══ SIDEBAR ═══ */}
      <div style={{
        width: sidebarOpen ? 280 : 60,
        background: "linear-gradient(180deg, #0c4a6e, #0e3654)",
        transition: "width 0.3s ease",
        display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "24px 20px" : "24px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏥</div>
          {sidebarOpen && <div><div style={{ color: "white", fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>UTI Manager</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5 }}>HUSE • Sergipe</div></div>}
        </div>

        {sidebarOpen && (
          <div style={{ flex: 1, overflow: "auto" }}>
            {/* SECTION: Dashboard */}
            <div style={{ padding: "16px 12px 8px" }}>
              <div onClick={goToDashboard} style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                background: view === "dashboard" ? "rgba(14,165,233,0.18)" : "transparent",
                border: view === "dashboard" ? "1px solid rgba(14,165,233,0.3)" : "1px solid transparent",
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 18 }}>📊</span>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Dashboard</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Visão gerencial da UTI</div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 20px" }} />

            {/* SECTION: Novo Áudio */}
            <div style={{ padding: "8px 12px 0" }}>
              <div onClick={goToAudio} style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                background: view === "newAudio" ? "rgba(34,197,94,0.18)" : "transparent",
                border: view === "newAudio" ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent",
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 18 }}>🎙️</span>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Novo Áudio</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Registrar laudo por voz</div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 20px" }} />

            {/* SECTION: Pacientes */}
            <div style={{ padding: "8px 12px" }}>
              <div onClick={() => setPatientsExpanded(!patientsExpanded)} style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                background: view === "patient" && !patientsExpanded ? "rgba(14,165,233,0.08)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🛏️</span>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Pacientes</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{patients.length} internados</div>
                  </div>
                </div>
                <span style={{
                  color: "rgba(255,255,255,0.4)", fontSize: 11,
                  transform: patientsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s", display: "inline-block",
                }}>▼</span>
              </div>

              {/* Patient list (expandable) */}
              {patientsExpanded && (
                <div style={{ paddingTop: 6, animation: "fadeIn 0.2s ease" }}>
                  {patients.map((p) => {
                    const days = getDays(p.admissionDate);
                    const isSelected = view === "patient" && selectedPatient?.id === p.id;
                    return (
                      <div key={p.id} onClick={() => goToPatient(p)} style={{
                        padding: "10px 14px 10px 36px", marginBottom: 2, borderRadius: 8, cursor: "pointer",
                        background: isSelected ? "rgba(14,165,233,0.18)" : "transparent",
                        border: isSelected ? "1px solid rgba(14,165,233,0.25)" : "1px solid transparent",
                        transition: "all 0.15s",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 800, color: "#bae6fd",
                              background: "rgba(14,165,233,0.15)", padding: "2px 7px", borderRadius: 5,
                            }}>{p.bed}</span>
                            <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 13 }}>{p.initials}</span>
                            <span style={{
                              fontSize: 9, padding: "1px 5px", borderRadius: 4,
                              background: p.gender === "F" ? "rgba(236,72,153,0.2)" : "rgba(59,130,246,0.2)",
                              color: p.gender === "F" ? "#f9a8d4" : "#93c5fd", fontWeight: 700,
                            }}>{p.gender === "F" ? "♀" : "♂"}</span>
                          </div>
                          <span style={{
                            fontSize: 10, color: dayColor(days), fontWeight: 700,
                            background: `${dayColor(days)}20`, padding: "2px 7px", borderRadius: 6,
                          }}>D{days}</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 3, paddingLeft: 32, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.clinicalStatus}
                        </div>
                        {p.reports[0] && (
                          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, marginTop: 2, paddingLeft: 32 }}>
                            Último laudo: {p.reports[0].date} {p.reports[0].time}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
        {view === "dashboard" && <ManagerDashboard patients={patients} onSelectPatient={goToPatient} />}
        {view === "patient" && selectedPatient && <PatientView patient={selectedPatient} onAddReport={handleAddReport} />}
        {view === "newAudio" && (
          <AudioChatView patients={patients} onSaveReport={handleAudioSave} onCreatePatient={handleCreatePatient} />
        )}
      </div>
    </div>
  );
}
