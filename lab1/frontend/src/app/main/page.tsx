'use client';

import {Button, PageHeader, PageHeaderHeading} from "@/shared/ui-toolkit";
import Image from "next/image";
import Link from "next/link";
import {useAuthContext} from "@/app/utilities";
import Table from "@/shared/ui-toolkit/table";
import React, {useState} from "react";
import AddCityForm from "@/shared/ui-toolkit/add-city";
import {MigratePopulationSearchDialog} from "@/shared/ui-toolkit/migrate-population-search-dialog";
import {MigratePopulationHalf} from "@/shared/ui-toolkit/migrate-population-half";
import {createTestObjects} from "@/app/utilities/providers/auth-provider/api-layer";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import DeleteByGovermentModal from "@/shared/ui-toolkit/delete-by-goverment";
import DeleteByTimezoneModal from "@/shared/ui-toolkit/delete-by-timezone";

export default function MainPage() {
    const {user} = useAuthContext();
    const [openHalf, setOpenHalf] = useState(false);
    const [openMove, setOpenMove] = useState(false);
    const [openDeleteGov, setOpenDeleteGov] = useState(false);
    const [openDeleteTZ, setOpenDeleteTZ] = useState(false);
    const refresh = () => {
    };

    const {accessToken} = useTokenRotation()

    if (!user) {
        return (
            <div className="flex flex-col py-10 gap-20">
                <PageHeader className='text-center items-center'>
                    <Image src="/catjail.jpg" alt="Default our app user" className='mb-5' width={200} height={100}/>
                    <PageHeaderHeading className="hidden md:block">Вы не авторизованы</PageHeaderHeading>
                    <PageHeaderHeading className="md:hidden">Too small</PageHeaderHeading>
                    <Link href="/auth/login?redirect=/main">
                        <Button variant='default' className='mt-5 scale-125' type='button'>Войти /
                            Зарегистрироваться</Button>
                    </Link>
                </PageHeader>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 py-6">
            <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setOpenMove(true)}>Переселить</Button>
                <Button variant="secondary" onClick={() => setOpenHalf(true)}>Переселить 50% со столицы</Button>
                <Button variant="secondary" onClick={() => {
                    createTestObjects(accessToken).then(() => {
                    })
                }}>Добавить 10 тестовых городов</Button>
                <Button variant="secondary" onClick={() => setOpenDeleteTZ(true)}>Удалить все объекты по timezone</Button>
                <Button variant="secondary" onClick={() => setOpenDeleteGov(true)}>Удалить один объект по government</Button>
            </div>
            <AddCityForm/>
            <MigratePopulationSearchDialog open={openMove} onOpenChange={setOpenMove} onSuccess={refresh}/>
            <MigratePopulationHalf open={openHalf} onOpenChange={setOpenHalf} onSuccess={refresh}/>
            <DeleteByGovermentModal open={openDeleteGov} onOpenChange={setOpenDeleteGov} onSuccess={refresh}/>
            <DeleteByTimezoneModal open={openDeleteTZ} onOpenChange={setOpenDeleteTZ} onSuccess={refresh}/>
            <Table fullWidth/>
        </div>
    );
}
