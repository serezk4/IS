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
import { AlertCircle, AtSign, KeyRound, UserCircle, UserPlus, Check, X } from "lucide-react";
import { SignupRequest } from "@/shared/types/auth";

type ApiError = { errorCode?: string; message?: string };

export function SignupForm() {
    const params = useSearchParams();
    const { signup, user } = useAuthContext();

    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [password, setPassword] = useState("");

    const getPasswordStrength = (password: string) => {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        score = Object.values(checks).filter(Boolean).length;
        
        return {
            score,
            checks,
            strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
        };
    };

    const parseError = (e: unknown): string => {
        if (!e) return "Неизвестная ошибка. Повторите попытку позже.";
        if (typeof e === "string") return e;
        if (e instanceof Error && e.message) return e.message;
        if (typeof e === "object") {
            const maybe = e as ApiError;
            if (maybe.message) return maybe.message;
            try {

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
            username: data.get("username") as string,
            email: data.get("email") as string,
            password,
            firstName: data.get("firstName") as string,
            lastName: data.get("lastName") as string
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
        <Card className="mx-auto w-full max-w-lg shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-3xl font-bold text-center">Регистрация</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    Создайте новый аккаунт для доступа к системе
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                            <div className="font-medium">Ошибка</div>
                            <p className="whitespace-pre-line">{error}</p>
                        </div>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium">
                                Имя
                            </Label>
                            <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Введите имя"
                                    className="pl-10 h-12"
                                    disabled={pending}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium">
                                Фамилия
                            </Label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Введите фамилию"
                                    className="pl-10 h-12"
                                    disabled={pending}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium">
                            Имя пользователя *
                        </Label>
                        <div className="relative">
                            <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Введите имя пользователя"
                                className="pl-10 h-12"
                                required
                                disabled={pending}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email *
                        </Label>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@domain.com"
                                className="pl-10 h-12"
                                required
                                disabled={pending}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Пароль *
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Минимум 8 символов"
                                className="pl-10 h-12"
                                required
                                disabled={pending}
                                minLength={8}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {password && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                getPasswordStrength(password).strength === 'weak' ? 'bg-red-500 w-1/3' :
                                                getPasswordStrength(password).strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                                                'bg-green-500 w-full'
                                            }`}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        {getPasswordStrength(password).strength === 'weak' ? 'Слабый' :
                                         getPasswordStrength(password).strength === 'medium' ? 'Средний' : 'Сильный'}
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs">
                                    {Object.entries(getPasswordStrength(password).checks).map(([key, passed]) => (
                                        <div key={key} className="flex items-center gap-2">
                                            {passed ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <X className="h-3 w-3 text-red-500" />
                                            )}
                                            <span className={passed ? 'text-green-600' : 'text-red-600'}>
                                                {key === 'length' && 'Минимум 8 символов'}
                                                {key === 'lowercase' && 'Строчные буквы (a-z)'}
                                                {key === 'uppercase' && 'Заглавные буквы (A-Z)'}
                                                {key === 'number' && 'Цифры (0-9)'}
                                                {key === 'special' && 'Специальные символы (!@#$%^&*)'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_repeat" className="text-sm font-medium">
                            Подтвердите пароль *
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password_repeat"
                                name="password_repeat"
                                type="password"
                                placeholder="Повторите пароль"
                                className="pl-10 h-12"
                                required
                                disabled={pending}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-medium" 
                        disabled={pending}
                    >
                        {pending ? "Создаём аккаунт..." : "Зарегистрироваться"}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Уже есть аккаунт? </span>
                    <Link
                        href={
                            websiteRoutes.auth.login +
                            ("?redirect=" + (params.get("redirect") || "/"))
                        }
                        className="font-medium text-primary hover:underline"
                    >
                        Войти
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
