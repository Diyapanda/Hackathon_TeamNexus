import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, Hash, Calendar, FlaskConical, Loader2 } from "lucide-react";

const statusTabs = [
    { value: "ordered", label: "Ordered", color: "bg-lab-cyan/20 text-lab-cyan" },
    { value: "in_process", label: "In Process", color: "bg-yellow-100 text-yellow-700" },
    { value: "completed", label: "Completed", color: "bg-lab-green/20 text-lab-green" },
];

export default function TestsOverview() {
    const [selected, setSelected] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transitioning, setTransitioning] = useState(new Set());

    useEffect(() => {
        fetch("/api/lab/orders", { method: "GET" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load orders");
                return res.json();
            })
            .then((data) => setOrders(data))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredTests = (status) => orders.filter((t) => t.status === status);

    const nextStatus = { ordered: "in_process", in_process: "completed" };

    const handleStatusChange = (order) => {
        const newStatus = nextStatus[order.status];
        if (!newStatus) return;
        const orderId = order.id;
        const oldStatus = order.status;

        setTransitioning((prev) => new Set(prev).add(orderId));
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

        fetch(`/api/lab/orders/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Status update failed");
            })
            .catch(() => {
                setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: oldStatus } : o)));
            })
            .finally(() => {
                setTransitioning((prev) => {
                    const next = new Set(prev);
                    next.delete(orderId);
                    return next;
                });
            });
    };

    if (loading) {
        return (
            <PageWrapper title="Tests Overview" subtitle="Track and manage all test requests.">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-lab-teal" />
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Tests Overview" subtitle="Track and manage all test requests.">
            <Tabs defaultValue="ordered" className="w-full">
                <TabsList className="mb-4">
                    {statusTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                            {tab.label}
                            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
                                {filteredTests(tab.value).length}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {statusTabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredTests(tab.value).map((test, i) => (
                                <motion.div
                                    key={test.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card
                                        className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                                        onClick={() => setSelected(test)}
                                    >
                                        <CardContent className="p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm">{test.testName}</span>
                                                <Badge className={tab.color} variant="secondary">
                                                    {tab.label}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> {test.patientName}</div>
                                                <div className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> {test.healthId}</div>
                                                <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {test.date}</div>
                                            </div>
                                            {test.packageName && (
                                                <Badge variant="outline" className="text-xs">{test.packageName}</Badge>
                                            )}
                                        </CardContent>
                                        {nextStatus[test.status] && (
                                            <div className="px-5 pb-4">
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                    disabled={transitioning.has(test.id)}
                                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(test); }}
                                                >
                                                    {transitioning.has(test.id) ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : null}
                                                    Move to {nextStatus[test.status] === "in_process" ? "In Process" : "Completed"}
                                                </Button>
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                            {filteredTests(tab.value).length === 0 && (
                                <p className="text-sm text-muted-foreground col-span-full py-8 text-center">No tests in this category.</p>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Detail Dialog */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-lab-teal" />
                            {selected?.testName}
                        </DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Patient</p>
                                    <p className="font-medium">{selected.patientName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Health ID</p>
                                    <p className="font-medium">{selected.healthId}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p className="font-medium">{selected.date}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge variant="secondary">{selected.status.replace("-", " ")}</Badge>
                                </div>
                            </div>
                            {selected.packageName && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Package</p>
                                    <Badge variant="outline">{selected.packageName}</Badge>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Tests Included</p>
                                <div className="flex flex-wrap gap-2">
                                    {selected.tests.map((t) => (
                                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
