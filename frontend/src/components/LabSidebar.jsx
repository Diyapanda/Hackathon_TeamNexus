import { LayoutDashboard, Upload, FlaskConical, BarChart3, Archive, Menu, ShieldCheck, Award, Building2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { LAB_INFO } from "@/data/mockData";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
    { title: "Dashboard", url: "/laboratory", icon: LayoutDashboard },
    { title: "Upload Reports", url: "/laboratory/upload", icon: Upload },
    { title: "Tests Overview", url: "/laboratory/tests", icon: FlaskConical },
    { title: "Analytics", url: "/laboratory/analytics", icon: BarChart3 },
    { title: "Archive", url: "/laboratory/archive", icon: Archive },
    { title: "Lab Profile", url: "/laboratory/profile", icon: Building2 },
];

export function LabSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-screen sticky top-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-w-0 flex-1"
                        >
                            <h2 className="text-base font-bold text-sidebar-primary truncate">{LAB_INFO.name}</h2>
                            <div className="mt-1.5 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-[11px] text-sidebar-accent-foreground">
                                    <ShieldCheck className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{LAB_INFO.certificationNo}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-sidebar-accent-foreground">
                                    <Award className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{LAB_INFO.accreditationNo}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors shrink-0"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.title}
                        to={item.url}
                        end={item.url === "/laboratory"}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-primary",
                            collapsed && "justify-center px-0"
                        )}
                        activeClassName="bg-sidebar-accent text-sidebar-primary"
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="whitespace-nowrap overflow-hidden"
                                >
                                    {item.title}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 border-t border-sidebar-border"
                    >
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-lab-green" />
                            <span className="text-xs text-sidebar-accent-foreground">System Online</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    );
}
