import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FlaskConical, FileCheck, Clock, Plus, Activity, Loader2 } from "lucide-react";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};
const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
    const [stats, setStats] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const iconMap = { tests_today: FlaskConical, completed: FileCheck, pending: Clock, new_requests: Plus };
    const colorMap = { tests_today: "text-lab-teal", completed: "text-lab-green", pending: "text-lab-cyan", new_requests: "text-lab-navy" };

    useEffect(() => {
        setLoading(true);
        fetch("/api/lab/dashboard-stats", { method: "GET" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load dashboard data");
                return res.json();
            })
            .then((data) => {
                const mappedStats = (data.stats || []).map((s) => ({
                    label: s.label,
                    value: s.value,
                    icon: iconMap[s.key] || FlaskConical,
                    color: colorMap[s.key] || "text-lab-teal",
                }));
                setStats(mappedStats);
                setRecentActivity(data.recent_activity || []);
            })
            .catch(() => setError("Unable to load dashboard. Please try again later."))
            .finally(() => setLoading(false));
    }, []);

    const statusColor = {
        ordered: "bg-lab-cyan/20 text-lab-cyan",
        in_process: "bg-yellow-100 text-yellow-700",
        completed: "bg-lab-green/20 text-lab-green",
        uploaded: "bg-lab-teal/20 text-lab-teal",
    };

    if (loading) {
        return (
            <PageWrapper title="Dashboard" subtitle="Welcome back — here's today's snapshot.">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-lab-teal" />
                </div>
            </PageWrapper>
        );
    }

    if (error) {
        return (
            <PageWrapper title="Dashboard" subtitle="Welcome back — here's today's snapshot.">
                <p className="text-sm text-destructive text-center py-10">{error}</p>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Dashboard" subtitle="Welcome back — here's today's snapshot.">
            <motion.div variants={container} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <motion.div key={s.label} variants={item}>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-accent ${s.color}`}>
                                    <s.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{s.label}</p>
                                    <p className="text-2xl font-bold">{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div variants={item} initial="hidden" animate="show" className="mt-8">
                <Card>
                    <CardHeader className="flex-row items-center gap-2 pb-4">
                        <Activity className="h-5 w-5 text-lab-teal" />
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentActivity.map((a) => (
                            <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <span className="text-sm">{a.text}</span>
                                <Badge className={statusColor[a.status] || ""} variant="secondary">
                                    {a.status.replace(/[-_]/g, " ")}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </PageWrapper>
    );
}
