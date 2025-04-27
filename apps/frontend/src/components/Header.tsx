import { useProcesses } from "../store/useProcesses"
import { Chip } from "./Chip"
import github from "../assets/github.png";
import { Button, Link } from "react-aria-components";
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useTheme } from "../store/useTheme";

export const Header = () => {
    const { loading, error } = useProcesses();
    const { theme, toggleTheme } = useTheme();

    const connected = !loading && !error;

    return (
        <header className="flex flex-row justify-between items-center w-full bg-white border-b-2 dark:border-neutral-100  py-2 px-2 dark:dark:bg-gray-800 dark:text-white">
            <div className="flex-1 flex items-center">
                <h1 className="text-xl font-bold">jomity.net</h1>
            </div>
            <div className="flex flex-row items-center gap-3">
                <Link href="https://github.com/J0m1ty/Status" className="hover:drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)] dark:hover:drop-shadow-[0_1px_5px_rgba(255,255,255,0.5)] transition duration-200">
                    <img src={github} alt="GitHub" className="size-[26px] dark:invert dark:brightness-0" />
                </Link>
                <Button
                    className="hover:drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)] dark:hover:drop-shadow-[0_1px_5px_rgba(255,255,255,0.5)] transition duration-200"
                    onPress={() => {
                        toggleTheme();
                    }}
                >
                    <div className="relative size-[28px]">
                        <SunIcon className={`size-[28px] absolute top-0 left-0 text-white ${theme === 'dark' ? 'block' : 'hidden'}`} />
                        <MoonIcon className={`size-[24px] m-[2px] absolute top-0 left-0 text-black ${theme === 'dark' ? 'hidden' : 'block'}`} />
                    </div>
                </Button>
                 <Chip
                    label={connected ? "API Connected" : "API Disconnected"}
                    className={`${
                        connected 
                            ? "text-emerald-800 bg-emerald-100 dark:text-emerald-100 dark:bg-emerald-800 [animation:var(--animate-pulse-success)] dark:[animation:var(--animate-pulse-success)]"
                            : "text-red-800 bg-red-100 dark:text-red-100 dark:bg-red-800 [animation:var(--animate-pulse-error)]"
                    }`}
                />
            </div>
        </header>
    )
}