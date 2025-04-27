import { FormEvent, useState } from "react";
import { Location, useLocation, useNavigate } from "react-router";
import { useAuth } from "../store/useAuth";
import { useMutation } from "@tanstack/react-query";
import { TextField, Button, Label, Input } from 'react-aria-components';
import { useTRPC } from "../utils/trpc";

export const Login = () => {
    const [username, setUser] = useState('');
    const [password, setPass] = useState('');
    const navigate = useNavigate();
    const { state } = useLocation() as { state: { from?: Location } };
    const { setToken } = useAuth();

    const trpc = useTRPC();

    const loginMutation = useMutation(trpc.auth.login.mutationOptions());

    const submit = (e: FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ username, password }, {
            onSuccess: (data) => {
                setToken(data.token);
                navigate(state?.from?.pathname ?? '/', { replace: true });
            },
            onError: (error) => {
                console.error('Login failed:', error);
            }
        });
    }

    return (
        <div className="grid place-items-center h-screen bg-gray-50">
            <form onSubmit={submit} className="space-y-6 p-6 rounded-xl bg-white shadow max-w-sm w-full">
                <h2 className="text-2xl font-semibold">Admin Login</h2>

                <div>
                    <TextField>
                        <Label className="block mb-1 text-sm font-medium">Username</Label>
                        <Input 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={e => setUser(e.target.value)}
                            aria-label="Username"
                        />
                    </TextField>
                </div>

                <div>
                    <TextField>
                        <Label className="block mb-1 text-sm font-medium">Password</Label>
                        <Input 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="password"
                            value={password}
                            onChange={e => setPass(e.target.value)}
                            aria-label="Password"
                        />
                    </TextField>
                </div>

                <Button
                    type="submit"
                    className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    isDisabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
                </Button>

                {loginMutation.error && <p className="text-red-600 text-sm">{loginMutation.error.message}</p>}
            </form>
        </div>
    )
}