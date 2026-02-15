import { useState, useEffect, useCallback } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Upload, FileText, MessageSquare, Mail, CheckCircle2, Loader2, Eye, X, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LabReportTemplate from "@/components/LabReportTemplate";
import { cn } from "@/lib/utils";

export default function UploadReports() {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [parameters, setParameters] = useState([]);
    const [paramValues, setParamValues] = useState({});
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notifySMS, setNotifySMS] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingParams, setLoadingParams] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const { toast } = useToast();

    const selectedOrder = pendingOrders.find((o) => String(o.id) === selectedOrderId);

    useEffect(() => {
        fetch("/api/lab/orders?status=ordered", { method: "GET" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load orders");
                return res.json();
            })
            .then((data) => setPendingOrders(data))
            .catch(() => toast({ title: "Error", description: "Could not load pending orders.", variant: "destructive" }))
            .finally(() => setLoadingOrders(false));
    }, []);

    useEffect(() => {
        if (!selectedOrder) { setParameters([]); setParamValues({}); return; }
        setLoadingParams(true);
        fetch(`/api/tests/${selectedOrder.testId || selectedOrder.id}/parameters`, { method: "GET" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load parameters");
                return res.json();
            })
            .then((data) => {
                setParameters(data);
                const initial = {};
                data.forEach((p) => {
                    const k = p.id || p.name;
                    initial[k] = "";
                });
                setParamValues(initial);
            })
            .catch(() => toast({ title: "Error", description: "Could not load test parameters.", variant: "destructive" }))
            .finally(() => setLoadingParams(false));
    }, [selectedOrderId]);

    const computeFlag = (param, value) => {
        const v = parseFloat(value);
        if (isNaN(v)) return null;
        if (param.criticalMin != null && v < param.criticalMin) return "critical";
        if (param.criticalMax != null && v > param.criticalMax) return "critical";
        if (param.min != null && v < param.min) return "abnormal";
        if (param.max != null && v > param.max) return "abnormal";
        return "normal";
    };

    const handleParamChange = (paramKey, value) => {
        setParamValues((prev) => {
            const newValues = { ...prev };
            newValues[paramKey] = value;
            return newValues;
        });
    };

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setFileUrl(null);
        }
    }, [file]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f?.type === "application/pdf") setFile(f);
    }, []);

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (f?.type === "application/pdf") setFile(f);
    };

    const handleUpload = () => {
        if (!selectedOrder) { toast({ title: "Error", description: "Please select an order.", variant: "destructive" }); return; }
        if (!file) { toast({ title: "Error", description: "Please attach a PDF report.", variant: "destructive" }); return; }
        if (file.type !== "application/pdf") { toast({ title: "Error", description: "Only PDF files are accepted.", variant: "destructive" }); return; }
        if (file.size > 5 * 1024 * 1024) { toast({ title: "Error", description: "File must be smaller than 5MB.", variant: "destructive" }); return; }

        const resultsPayload = parameters.map((p) => {
            const key = p.id || p.name;
            const val = paramValues[key];
            return { param_id: key, value: val, result_flag: computeFlag(p, val) };
        }).filter((r) => r.value !== "");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("order_id", selectedOrder.id);
        formData.append("parameters", JSON.stringify(resultsPayload));
        formData.append("notify_sms", notifySMS);
        formData.append("notify_email", notifyEmail);

        setSubmitting(true);
        fetch("/api/lab/reports", { method: "POST", body: formData })
            .then(async (res) => {
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText);
                }
                return res.json();
            })
            .then(() => {
                setUploaded(true);
                toast({ title: "Report Uploaded", description: `Report uploaded for ${selectedOrder.patientName || "patient"}.` });
            })
            .catch(async (err) => {
                let msg = "Could not upload the report.";
                try {
                    const errorData = JSON.parse(err.message);
                    if (errorData.detail) msg = errorData.detail;
                } catch {
                    msg = err.message || msg;
                }
                toast({ title: "Upload Failed", description: msg, variant: "destructive" });
            })
            .finally(() => setSubmitting(false));
    };

    const handleSms = () => {
        toast({ title: "SMS Sent", description: `Alert sent to patient.` });
    };

    const handleEmail = () => {
        toast({ title: "Email Sent", description: `Alert sent to patient.` });
    };

    return (
        <PageWrapper title="Upload Lab Reports" subtitle="Look up a patient by Health ID and upload their report.">
            <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0 max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Upload className="h-4 w-4 text-lab-teal" /> Select Pending Order
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loadingOrders ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-lab-teal" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="order-selection">Select Clinical Order</Label>
                                    <Select value={selectedOrderId} onValueChange={(val) => { setSelectedOrderId(val); setUploaded(false); setFile(null); }}>
                                        <SelectTrigger id="order-selection">
                                            <SelectValue placeholder="Choose an order…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pendingOrders.map((o) => (
                                                <SelectItem key={o.id} value={String(o.id)}>
                                                    {o.patientName} — {o.testName} ({o.healthId})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {selectedOrder && (
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground">
                                            {(selectedOrder.patientName || "?").charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{selectedOrder.patientName}</p>
                                            <p className="text-sm text-muted-foreground">{selectedOrder.healthId} · {selectedOrder.testName}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {loadingParams ? (
                                <Card>
                                    <CardContent className="p-5 flex items-center justify-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-lab-teal" />
                                    </CardContent>
                                </Card>
                            ) : parameters.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Test Parameters</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {parameters.map((p) => {
                                            const key = p.id || p.name;
                                            const val = paramValues[key] || "";
                                            const flag = computeFlag(p, val);
                                            return (
                                                <div key={key} className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor={`input-param-${key}`}>{p.name} {p.unit ? `(${p.unit})` : ""}</Label>
                                                        {flag && (
                                                            <Badge variant="secondary" className={
                                                                flag === "critical" ? "bg-red-100 text-red-700" :
                                                                    flag === "abnormal" ? "bg-yellow-100 text-yellow-700" :
                                                                        "bg-lab-green/20 text-lab-green"
                                                            }>{flag}</Badge>
                                                        )}
                                                    </div>
                                                    <input
                                                        id={`input-param-${key}`}
                                                        type="text"
                                                        autoComplete="off"
                                                        data-lpignore="true"
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                                                        placeholder={p.min != null && p.max != null ? `Range: ${p.min} - ${p.max}` : "Enter value"}
                                                        value={val}
                                                        onChange={(e) => {
                                                            console.log(`Input change for ${key}:`, e.target.value);
                                                            handleParamChange(key, e.target.value);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            )}

                            {!uploaded ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Upload className="h-4 w-4 text-lab-teal" /> Upload PDF Report
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById("file-input")?.click()}
                                            className={cn(
                                                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                                                dragOver ? "border-lab-teal bg-lab-teal/5" : "border-border hover:border-lab-teal/50 hover:bg-muted/50",
                                                file ? "bg-muted/30 border-lab-teal/30" : ""
                                            )}
                                        >
                                            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                            {file ? (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <p className="text-sm font-medium">{file.name}</p>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Drag & drop a PDF here, or click to browse</p>
                                            )}
                                            <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                                        </div>

                                        <div className="mt-6 space-y-4 border-t pt-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox id="notify-sms" checked={notifySMS} onCheckedChange={setNotifySMS} />
                                                    <Label htmlFor="notify-sms" className="flex items-center gap-1 cursor-pointer">
                                                        <MessageSquare className="h-3.5 w-3.5" /> Notify via SMS
                                                    </Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox id="notify-email" checked={notifyEmail} onCheckedChange={setNotifyEmail} />
                                                    <Label htmlFor="notify-email" className="flex items-center gap-1 cursor-pointer">
                                                        <Mail className="h-3.5 w-3.5" /> Notify via Email
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowPreview(true)}>
                                                    <Eye className="h-4 w-4" /> Preview
                                                </Button>
                                                <Button onClick={handleUpload} className="flex-1" disabled={submitting}>
                                                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                    Upload
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-lab-green/30">
                                    <CardContent className="p-6 text-center space-y-4">
                                        <CheckCircle2 className="h-12 w-12 mx-auto text-lab-green" />
                                        <p className="font-semibold text-lg">Report Uploaded Successfully</p>
                                        <div className="flex justify-center gap-3 pt-2">
                                            <Button variant="outline" onClick={handleSms} className="gap-2">
                                                <MessageSquare className="h-4 w-4" /> Send SMS
                                            </Button>
                                            <Button variant="outline" onClick={handleEmail} className="gap-2">
                                                <Mail className="h-4 w-4" /> Send Email
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>

                {/* PDF Preview Panel */}
                <div className="hidden lg:block w-[420px] flex-shrink-0 sticky top-6">
                    <Card className="h-[calc(100vh-8rem)] flex flex-col">
                        <CardHeader className="pb-3 flex-shrink-0">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Eye className="h-4 w-4 text-lab-teal" /> Report Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 p-4 pt-0">
                            {fileUrl ? (
                                <iframe src={fileUrl} title="PDF Preview" className="w-full h-full rounded-lg border" />
                            ) : (
                                <div className="w-full h-full rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-3">
                                    <FileText className="h-12 w-12 opacity-40" />
                                    <p className="text-sm text-center px-4">Upload a PDF to see the preview here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto p-0">
                    <DialogTitle className="sr-only">Report Preview</DialogTitle>
                    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-background border-b">
                        <span className="text-sm font-semibold">Report Preview</span>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.print()}>
                            <Printer className="h-3.5 w-3.5" /> Print
                        </Button>
                    </div>
                    <div className="p-4">
                        <LabReportTemplate
                            lab={{
                                name: "MedCore Diagnostics",
                                registration_number: "CERT-2024-MED-8741",
                                accreditation_number: "NABL-TC-5923",
                                address: "42, Health Avenue, Sector 15, Bengaluru",
                                phone: "+91-80-2345-6789",
                                email: "reports@medcore.in",
                            }}
                            patient={selectedOrder ? {
                                full_name: selectedOrder.patientName,
                                health_id: selectedOrder.healthId,
                                age: selectedOrder.age || "—",
                                gender: selectedOrder.gender || "—",
                            } : {}}
                            order={selectedOrder ? {
                                report_id: `RPT-${selectedOrder.id}`,
                                order_id: selectedOrder.id,
                                collected_on: new Date().toISOString().split('T')[0],
                                reported_on: new Date().toISOString().split('T')[0],
                            } : {}}
                            test={{
                                category: selectedOrder?.testName?.toUpperCase() || "",
                                test_name: selectedOrder?.testName || "",
                                description: "",
                            }}
                            parameters={parameters.map((p) => {
                                const key = p.id || p.name;
                                const val = paramValues[key] || "";
                                const flag = computeFlag(p, val);
                                return {
                                    name: p.name,
                                    value: val || "—",
                                    unit: p.unit || "",
                                    reference_range: p.min != null && p.max != null ? `${p.min} - ${p.max}` : "",
                                    flag: flag,
                                };
                            })}
                            technician={{ full_name: "Lab Technician", designation: "Medical Lab Technician" }}
                            approver={{ full_name: "Dr. Rajesh Kumar", designation: "Consultant Pathologist" }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
