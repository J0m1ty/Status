import { Header } from "../components/Header";
import { ProcessTable } from "../components/ProcessTable";
import { useStatus } from "../hooks/useStatus";

export const Dashboard = () => {
    useStatus();

    return (
        <div className="w-full h-svh flex flex-col bg-white dark:bg-neutral-900">
            <Header />
            <div className="pt-5 flex-1 flex flex-col gap-4 justify-start items-center bg-[radial-gradient(#dcdee3_1px,transparent_1px)] dark:bg-[radial-gradient(#413c37_1px,transparent_1px)] [background-size:16px_16px] overflow-y-auto">
                <ProcessTable />
            </div>
        </div>
    )
}