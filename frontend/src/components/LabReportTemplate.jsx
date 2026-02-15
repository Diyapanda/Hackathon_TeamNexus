export default function LabReportTemplate({ lab, patient, order, test, parameters = [], technician, approver }) {
    const flagLabel = (flag) => {
        if (!flag || flag === "normal") return null;
        if (flag === "critical") return "C";
        if (flag.includes("high") || flag === "abnormal") return "H";
        if (flag.includes("low")) return "L";
        return null;
    };

    const flagStyle = (flag) => {
        if (!flag || flag === "normal") return "";
        if (flag === "critical") return "text-red-600 font-bold";
        return "text-amber-600 font-semibold";
    };

    const rowBg = (flag) => {
        if (flag === "critical") return "bg-red-50";
        if (flag === "abnormal" || flag?.includes("high") || flag?.includes("low")) return "bg-amber-50/50";
        return "";
    };

    return (
        <div className="bg-white text-gray-900 w-[210mm] mx-auto font-[system-ui] text-[13px] leading-relaxed print:shadow-none shadow-lg" style={{ minHeight: "297mm" }}>
            <div className="p-10 flex flex-col min-h-[297mm]">

                {/* ─── 1. Header ─── */}
                <header className="flex items-start justify-between gap-6 pb-5 border-b-2 border-gray-800">
                    <div className="shrink-0">
                        {lab?.logo_url ? (
                            <img src={lab.logo_url} alt="Lab Logo" className="h-16 w-16 object-contain" />
                        ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-xl font-bold text-gray-400">
                                {(lab?.name || "L").charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">{lab?.name || "Laboratory Name"}</h1>
                        <div className="mt-1 space-y-0.5 text-[11px] text-gray-600">
                            {lab?.registration_number && <p>Reg. No: {lab.registration_number}</p>}
                            {lab?.accreditation_number && <p>Accreditation: {lab.accreditation_number}</p>}
                            {lab?.address && <p>{lab.address}</p>}
                            <p>
                                {lab?.phone && <span>Tel: {lab.phone}</span>}
                                {lab?.phone && lab?.email && <span> &nbsp;|&nbsp; </span>}
                                {lab?.email && <span>{lab.email}</span>}
                            </p>
                        </div>
                    </div>
                </header>

                {/* ─── 2. Report Info ─── */}
                <section className="mt-5 flex items-start justify-between gap-4">
                    <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-[12px]">
                        <span className="text-gray-500">Report ID</span>
                        <span className="font-medium">{order?.report_id || "—"}</span>
                        <span className="text-gray-500">Order ID</span>
                        <span className="font-medium">{order?.order_id || "—"}</span>
                        <span className="text-gray-500">Collected On</span>
                        <span className="font-medium">{order?.collected_on || "—"}</span>
                        <span className="text-gray-500">Reported On</span>
                        <span className="font-medium">{order?.reported_on || "—"}</span>
                    </div>
                    {/* QR placeholder */}
                    <div className="h-16 w-16 border border-dashed border-gray-300 rounded flex items-center justify-center text-[9px] text-gray-400 shrink-0">
                        QR
                    </div>
                </section>

                {/* ─── 3. Patient Details ─── */}
                <section className="mt-5 p-4 bg-gray-50 rounded border border-gray-200">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Patient Information</h2>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-1.5 text-[12px]">
                        <div>
                            <span className="text-gray-500 block text-[10px]">Name</span>
                            <span className="font-semibold">{patient?.full_name || "—"}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-[10px]">Health ID</span>
                            <span className="font-semibold">{patient?.health_id || "—"}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-[10px]">Age / Gender</span>
                            <span className="font-semibold">
                                {patient?.age || "—"}y / {patient?.gender || "—"}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ─── 4. Test Section Header ─── */}
                <section className="mt-6">
                    {test?.category && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{test.category}</p>
                    )}
                    <h3 className="text-base font-bold mt-0.5">{test?.test_name || "Test Name"}</h3>
                </section>

                {/* ─── 5. Results Table ─── */}
                <section className="mt-4 flex-1">
                    <table className="w-full border-collapse text-[12px]">
                        <thead>
                            <tr className="border-y-2 border-gray-800 text-left">
                                <th className="py-2 pr-3 font-bold text-gray-700">Parameter</th>
                                <th className="py-2 pr-3 font-bold text-gray-700 text-right">Value</th>
                                <th className="py-2 pr-3 font-bold text-gray-700">Unit</th>
                                <th className="py-2 pr-3 font-bold text-gray-700">Reference Range</th>
                                <th className="py-2 font-bold text-gray-700 text-center w-10">Flag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parameters.map((p, i) => {
                                const fl = flagLabel(p.flag);
                                return (
                                    <tr key={i} className={`border-b border-gray-200 ${rowBg(p.flag)}`}>
                                        <td className="py-2 pr-3">{p.name}</td>
                                        <td className={`py-2 pr-3 text-right font-medium ${flagStyle(p.flag)}`}>{p.value ?? "—"}</td>
                                        <td className="py-2 pr-3 text-gray-500">{p.unit || ""}</td>
                                        <td className="py-2 pr-3 text-gray-500">{p.reference_range || ""}</td>
                                        <td className={`py-2 text-center font-bold ${flagStyle(p.flag)}`}>
                                            {fl || ""}
                                        </td>
                                    </tr>
                                );
                            })}
                            {parameters.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-gray-400 italic">No parameters recorded</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* ─── 6. Clinical Notes ─── */}
                {test?.description && (
                    <section className="mt-6 p-3 bg-gray-50 rounded border border-gray-200">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Clinical Notes</h4>
                        <p className="text-[12px] text-gray-700 whitespace-pre-line">{test.description}</p>
                    </section>
                )}

                {/* ─── 7. Signatures ─── */}
                <section className="mt-8 pt-6 border-t border-gray-300 flex items-end justify-between gap-8">
                    <div className="text-center">
                        <div className="h-12 mb-1" />
                        <p className="text-[12px] font-semibold">{technician?.full_name || "Lab Technician"}</p>
                        <p className="text-[10px] text-gray-500">{technician?.designation || "Medical Lab Technician"}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Tested By</p>
                    </div>
                    <div className="text-center">
                        {lab?.signature_url ? (
                            <img src={lab.signature_url} alt="Authorized Signature" className="h-12 mx-auto mb-1 object-contain" />
                        ) : (
                            <div className="h-12 mb-1" />
                        )}
                        <p className="text-[12px] font-semibold">{approver?.full_name || "Pathologist"}</p>
                        <p className="text-[10px] text-gray-500">{approver?.designation || "Consultant Pathologist"}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Verified &amp; Approved By</p>
                    </div>
                </section>

                {/* ─── 8. Footer Disclaimer ─── */}
                <footer className="mt-8 pt-4 border-t border-gray-200 text-[9px] text-gray-400 text-center space-y-0.5">
                    <p>This report is electronically generated and is valid without a physical signature.</p>
                    <p>Results should be interpreted by a qualified physician in clinical context.</p>
                </footer>
            </div>
        </div>
    );
}
