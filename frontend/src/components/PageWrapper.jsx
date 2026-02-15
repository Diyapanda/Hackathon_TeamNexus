import { motion } from "framer-motion";

export function PageWrapper({ children, title, subtitle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 p-6 lg:p-8 overflow-auto"
        >
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {children}
        </motion.div>
    );
}
