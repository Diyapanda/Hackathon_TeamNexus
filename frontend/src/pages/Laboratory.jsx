import React from 'react';
import { Outlet } from 'react-router-dom';
import { LabSidebar } from "@/components/LabSidebar";

const Laboratory = () => {
    return (
        <div className="flex h-screen bg-background">
            <LabSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Laboratory;
