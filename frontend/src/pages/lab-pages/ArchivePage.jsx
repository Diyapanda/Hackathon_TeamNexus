import { useState, useEffect, useMemo } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { Search, FileText, MessageSquare, Mail, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArchivePage() {
    const [search, setSearch] = useState("");
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/api/lab/reports?range=30days", { method: "GET" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load reports");
                return res.json();
            })
            .then((data) => setReports(data))
            .catch(() => setError("Unable to load reports. Please try again later."))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return reports.filter(
            (r) =>
                (r.healthId || "").toLowerCase().includes(q) ||
                (r.patientName || "").toLowerCase().includes(q) ||
                (r.testName || "").toLowerCase().includes(q)
        );
    }, [search, reports]);

    const flagColor = {
        normal: "bg-lab-green/20 text-lab-green",
        abnormal: "bg-yellow-100 text-yellow-700",
        critical: "bg-red-100 text-red-700",
    };

    if (loading) {
        return (
            <PageWrapper title="Archive" subtitle="Submitted reports — displayed for 30 days after upload.">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-lab-teal" />
                </div>
            </PageWrapper>
        );
    }

    if (error) {
        return (
            <PageWrapper title="Archive" subtitle="Submitted reports — displayed for 30 days after upload.">
                <p className="text-sm text-destructive text-center py-10">{error}</p>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Archive" subtitle="Submitted reports — displayed for 30 days after upload.">
            <div className="space-y-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="archive-search"
                        aria-label="Search reports"
                        placeholder="Search by Health ID, name, or test…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Report</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Health ID</TableHead>
                                        <TableHead>Upload Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notifications</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-lab-teal" />
                                                {r.testName}
                                            </TableCell>
                                            <TableCell>{r.patientName}</TableCell>
                                            <TableCell><Badge variant="outline">{r.healthId}</Badge></TableCell>
                                            <TableCell>{r.uploadDate}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1.5">
                                                    {r.result_flag && (
                                                        <Badge className={flagColor[r.result_flag] || ""} variant="secondary">
                                                            {r.result_flag}
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        variant={
                                                            r.status === "Completed" ? "default" :
                                                                r.status === "Verified" ? "secondary" : "outline"
                                                        }
                                                        className={
                                                            r.status === "Completed" ? "bg-lab-teal hover:bg-lab-teal/90" :
                                                                r.status === "Verified" ? "bg-lab-green text-white hover:bg-lab-green/90" :
                                                                    "text-muted-foreground"
                                                        }
                                                    >
                                                        {r.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1.5">
                                                    {r.smsNotified && (
                                                        <Badge variant="secondary" className="text-xs gap-1">
                                                            <MessageSquare className="h-3 w-3" /> SMS
                                                        </Badge>
                                                    )}
                                                    {r.emailNotified && (
                                                        <Badge variant="secondary" className="text-xs gap-1">
                                                            <Mail className="h-3 w-3" /> Email
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1 text-xs"
                                                    onClick={() => r.downloadUrl && window.open(r.downloadUrl, "_blank")}
                                                    disabled={!r.downloadUrl}
                                                >
                                                    <Download className="h-3.5 w-3.5" /> Download
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filtered.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No reports found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </PageWrapper>
    );
}
