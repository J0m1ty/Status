import { useEffect } from "react";
import ProcessTable from "../components/ProcessTable"
import { initSSE } from "../store/useProcesses";

export const Dashboard = () => {
    useEffect(() => initSSE(), []);

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-6">Process List</h1>
                <ProcessTable />
            </div>
        </main>
    )
}