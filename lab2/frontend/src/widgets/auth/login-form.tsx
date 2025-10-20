'use client';

import Link from "next/link"
import { AtSign, KeyRound, UserCircle } from "lucide-react"

import { Button } from "@/shared/ui-toolkit/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui-toolkit/card"
import { Input } from "@/shared/ui-toolkit/input"
import { Label } from "@/shared/ui-toolkit/label"
import {websiteRoutes} from "@/app/routing";
import {FormEvent, useEffect, useState} from "react";
import {useAuthContext} from "@/app/utilities";
import {redirect, useSearchParams} from "next/navigation";

export function LoginForm() {
  const {login, user} = useAuthContext();
  const params = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData(e.currentTarget);
      const success = await login(
        data.get('username') as string,
        data.get('password') as string
      );
      
      if (success) {
        redirect(params.get('redirect') || websiteRoutes.home);
      } else {
        setError('Неверные учетные данные. Проверьте логин и пароль.');
      }
    } catch (err) {
      setError('Произошла ошибка при входе. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      redirect(params.get('redirect') || websiteRoutes.home);
    }
  }, [user]);

  return (
      <Card className="mx-auto w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Вход в систему</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Введите свои учетные данные для входа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Имя пользователя или email
              </Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Введите имя пользователя или email"
                  className="pl-10 h-12"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Пароль
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  className="pl-10 h-12"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Нет аккаунта? </span>
            <Link 
              href={websiteRoutes.auth.signup+'?redirect='+(params.get('redirect') || '/')} 
              className="font-medium text-primary hover:underline"
            >
              Зарегистрироваться
            </Link>
          </div>
        </CardContent>
      </Card>
  )
};
