import { Header } from "../components/Header";
import { useEventSource } from "../store/useEventSource";

export const Dashboard = () => {
    useEventSource();

    return (
        <div className="w-full h-svh flex flex-col bg-white dark:bg-stone-900">
            <Header />
            <main className="flex-1 flex flex-col justify-start items-start bg-[radial-gradient(#dcdee3_1px,transparent_1px)] dark:bg-[radial-gradient(#413c37_1px,transparent_1px)] [background-size:16px_16px] overflow-y-auto">
                
            </main>
        </div>
    )
}