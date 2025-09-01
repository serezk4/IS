'use client';

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label
} from "@/shared/ui-toolkit";
import Link from "next/link";
import {websiteRoutes} from "@/app/routing";
import {useAuthContext} from "@/app/utilities";
import {FormEvent, useEffect, useState} from "react";
import {redirect, useSearchParams} from "next/navigation";
import { AlertCircle } from "lucide-react";

type ApiError = { errorCode?: string; message?: string };

export function SignupForm() {
    const params = useSearchParams();
    const { signup, user } = useAuthContext();

    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const parseError = (e: unknown): string => {
        if (!e) return "Неизвестная ошибка. Повторите попытку позже.";
        if (typeof e === "string") return e;
        if (e instanceof Error && e.message) return e.message;
        if (typeof e === "object") {
            const maybe = e as ApiError;
            if (maybe.message) return maybe.message;
            try {
                // Иногда прокидывают текстом JSON
                const asText = JSON.stringify(e);
                const parsed = JSON.parse(asText) as ApiError;
                if (parsed?.message) return parsed.message;
            } catch {}
        }
        return "Произошла ошибка. Повторите попытку позже.";
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const data = new FormData(event.currentTarget);
        const password = (data.get("password") as string) || "";
        const passwordRepeat = (data.get("password_repeat") as string) || "";

        if (password !== passwordRepeat) {
            setError("Пароли не совпадают");
            return;
        }

        const requestData: SignupRequest = {
            email: data.get("email") as string,
            password,
            passwordRepeat
        };

        setPending(true);
        try {
            const ok = await signup(requestData);
            if (ok) {
                redirect(params.get("redirect") || websiteRoutes.home);
            } else {
                setError("Не удалось создать аккаунт. Попробуйте позже.");
            }
        } catch (e) {
            setError(parseError(e));
        } finally {
            setPending(false);
        }
    };

    useEffect(() => {
        if (user) {
            redirect(params.get("redirect") || websiteRoutes.home);
        }
    }, [user]);

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Sign up</CardTitle>
                <CardDescription>
                    Provide all the data marked with (*) to create an account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div
                        role="alert"
                        className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                            <div className="font-medium">Ошибка</div>
                            <p className="whitespace-pre-line">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="johndoe@webster.edu"
                            required
                            disabled={pending}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            disabled={pending}
                            minLength={8}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_repeat">Repeat Password *</Label>
                        <Input
                            id="password_repeat"
                            name="password_repeat"
                            type="password"
                            required
                            disabled={pending}
                            autoComplete="new-password"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? "Создаём аккаунт..." : "Sign up"}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link
                        href={
                            websiteRoutes.auth.login +
                            ("?redirect=" + (params.get("redirect") || "/"))
                        }
                        className="underline"
                    >
                        Log in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
