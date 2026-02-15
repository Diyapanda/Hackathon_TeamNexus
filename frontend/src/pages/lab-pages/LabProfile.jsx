import { useState, useEffect, useRef } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Building2, User, Phone, MapPin, ShieldCheck, Camera, Save, Loader2, Pencil, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};
const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function LabProfile() {
    const [profile, setProfile] = useState({
        labName: "MedCore Diagnostics",
        registrationNo: "CERT-2024-MED-8741",
        adminName: "Dr. Rajesh Kumar",
        adminId: "ADM-001",
        address: "42, Health Avenue, Sector 15, Bengaluru, Karnataka 560001",
        phone1: "+91-80-2345-6789",
        phone2: "+91-80-2345-6790",
        logoUrl: null,
    });
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ ...profile });
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const fileRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        fetch("/api/lab/profile", { method: "GET" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed");
                return res.json();
            })
            .then((data) => {
                setProfile(data);
                setDraft(data);
                if (data.logoUrl) setLogoPreview(data.logoUrl);
            })
            .catch(() => { });
    }, []);

    const handleEdit = () => {
        setDraft({ ...profile });
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setDraft({ ...profile });
        setLogoPreview(profile.logoUrl || null);
    };

    const handleChange = (field, value) => {
        setDraft((prev) => ({ ...prev, [field]: value }));
    };

    const handleLogoChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
            return;
        }
        const url = URL.createObjectURL(f);
        setLogoPreview(url);
        setDraft((prev) => ({ ...prev, _logoFile: f }));
    };

    const handleSave = () => {
        setSaving(true);
        const body = { ...draft };
        delete body._logoFile;

        fetch("/api/lab/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Save failed");
                return res.json();
            })
            .then((data) => {
                setProfile(data);
                setDraft(data);
                setEditing(false);
                toast({ title: "Profile Saved", description: "Lab profile updated successfully." });
            })
            .catch(() => toast({ title: "Error", description: "Could not save profile. Please try again.", variant: "destructive" }))
            .finally(() => setSaving(false));
    };

    const initials = (profile.labName || "L")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const fields = [
        { key: "labName", label: "Lab Name", icon: Building2, editable: true },
        { key: "registrationNo", label: "Registration Number", icon: ShieldCheck, editable: false },
        { key: "adminName", label: "Admin Name", icon: User, editable: true },
        { key: "adminId", label: "Admin ID", icon: User, editable: true },
        { key: "address", label: "Lab Address", icon: MapPin, editable: true },
        { key: "phone1", label: "Phone Number 1", icon: Phone, editable: true },
        { key: "phone2", label: "Phone Number 2", icon: Phone, editable: true },
    ];

    return (
        <PageWrapper title="Lab Profile" subtitle="Manage your laboratory details and branding.">
            <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-6">

                {/* Logo & Header */}
                <motion.div variants={item}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Lab Logo"
                                            className="h-20 w-20 rounded-2xl object-cover border-2 border-border"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-lab-teal to-lab-cyan flex items-center justify-center text-2xl font-bold text-white">
                                            {initials}
                                        </div>
                                    )}
                                    {editing && (
                                        <button
                                            onClick={() => fileRef.current?.click()}
                                            className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <Camera className="h-6 w-6 text-white" />
                                        </button>
                                    )}
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold truncate">{profile.labName}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="bg-lab-teal/10 text-lab-teal gap-1">
                                            <ShieldCheck className="h-3 w-3" /> {profile.registrationNo}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    {!editing ? (
                                        <Button variant="outline" onClick={handleEdit} className="gap-2">
                                            <Pencil className="h-4 w-4" /> Edit Profile
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button variant="ghost" onClick={handleCancel} className="gap-1">
                                                <X className="h-4 w-4" /> Cancel
                                            </Button>
                                            <Button onClick={handleSave} disabled={saving} className="gap-1">
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                Save
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Profile Fields */}
                <motion.div variants={item}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Lab Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {fields.map((f) => (
                                <div key={f.key} className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 text-muted-foreground">
                                        <f.icon className="h-3.5 w-3.5" /> {f.label}
                                        {!f.editable && (
                                            <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1.5">Read Only</Badge>
                                        )}
                                    </Label>
                                    {editing ? (
                                        <Input
                                            value={draft[f.key] || ""}
                                            onChange={(e) => handleChange(f.key, e.target.value)}
                                            disabled={!f.editable}
                                            className={!f.editable ? "bg-muted cursor-not-allowed" : ""}
                                        />
                                    ) : (
                                        <p className="text-sm font-medium pl-1">{profile[f.key] || "—"}</p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

            </motion.div>
        </PageWrapper>
    );
}
