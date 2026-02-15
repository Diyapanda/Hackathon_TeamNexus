import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Package, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = [
    "hsl(174, 62%, 38%)",
    "hsl(187, 70%, 45%)",
    "hsl(155, 50%, 45%)",
    "hsl(210, 60%, 45%)",
    "hsl(195, 50%, 50%)",
    "hsl(168, 45%, 50%)",
];

const cardAnim = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Analytics() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/api/lab/analytics", { method: "GET" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load analytics");
                return res.json();
            })
            .then((data) => setAnalyticsData(data))
            .catch(() => setError("Unable to load analytics. Please try again later."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <PageWrapper title="Analytics" subtitle="Insights on test orders and positive results.">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-lab-teal" />
                </div>
            </PageWrapper>
        );
    }

    if (error || !analyticsData) {
        return (
            <PageWrapper title="Analytics" subtitle="Insights on test orders and positive results.">
                <p className="text-sm text-destructive text-center py-10">{error || "No data available."}</p>
            </PageWrapper>
        );
    }
    return (
        <PageWrapper title="Analytics" subtitle="Insights on test orders and positive results.">
            <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.12 } } }}
                className="grid gap-6 lg:grid-cols-2"
            >
                {/* Frequent Individual Tests */}
                <motion.div variants={cardAnim}>
                    <Card>
                        <CardHeader className="flex-row items-center gap-2 pb-2">
                            <TrendingUp className="h-5 w-5 text-lab-teal" />
                            <CardTitle className="text-base">Frequently Ordered Tests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={analyticsData.frequentTests} layout="vertical" margin={{ left: 8 }}>
                                    <XAxis type="number" fontSize={12} />
                                    <YAxis type="category" dataKey="name" width={140} fontSize={11} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="hsl(174, 62%, 38%)" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Frequent Packages */}
                <motion.div variants={cardAnim}>
                    <Card>
                        <CardHeader className="flex-row items-center gap-2 pb-2">
                            <Package className="h-5 w-5 text-lab-cyan" />
                            <CardTitle className="text-base">Frequently Ordered Packages</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={analyticsData.frequentPackages}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        fontSize={11}
                                    >
                                        {analyticsData.frequentPackages.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Frequently Positive */}
                <motion.div variants={cardAnim} className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex-row items-center gap-2 pb-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-base">Frequently Positive Tests (100+ cases)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {analyticsData.frequentPositives.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                        <div>
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.count} cases</p>
                                        </div>
                                        <Badge variant={item.severity === "high" ? "destructive" : "secondary"}>
                                            {item.severity}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}
