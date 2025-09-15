'use client';

import {Button, PageHeader, PageHeaderHeading} from "@/shared/ui-toolkit";
import Image from "next/image";
import Link from "next/link";
import {useAuthContext} from "@/app/utilities";
import Table from "@/shared/ui-toolkit/table";
import React, {useState} from "react";
import AddCityForm from "@/shared/ui-toolkit/add-book-creature";
import {createTestObjects} from "@/app/utilities/providers/auth-provider/api-layer";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import DeleteByAttackLevelModal from "@/shared/ui-toolkit/delete-by-attack-level";
import DistributeRings from "@/shared/ui-toolkit/distribute-rings";
import StatsByUsers from "@/shared/ui-toolkit/stats-by-users";
import UniqueDefenseLevelsDialog from "@/shared/ui-toolkit/unique-defense-level";
import GroupByCreatureTypeDialog from "@/shared/ui-toolkit/group-by-creature-group";

export default function MainPage() {
    const {user} = useAuthContext();
    const [openHalf, setOpenHalf] = useState(false);
    const [openMove, setOpenMove] = useState(false);
    const [openDeleteGov, setOpenDeleteGov] = useState(false);
    const [openDeleteTZ, setOpenDeleteTZ] = useState(false);
    const [openGroupByCreatureType, setOpenGroupByCreatureType] = useState(false);
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
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="w-full">
                    <Button className="w-full" variant="secondary" onClick={() => setOpenGroupByCreatureType(true)}>
                        Группировка по типу создания
                    </Button>
                </div>
                <div className="w-full">
                    <Button className="w-full" variant="secondary" onClick={() => setOpenMove(true)}>
                        Уникальные уровни атаки
                    </Button>
                </div>
                <div className="w-full">
                    <Button className="w-full" variant="secondary" onClick={() => setOpenHalf(true)}>
                        Статистика владельцев
                    </Button>
                </div>
                <div className="w-full">
                    <Button className="w-full" variant="secondary" onClick={() => {
                        createTestObjects(accessToken).then(() => {
                        });
                    }}>
                        10 тестовых объектов
                    </Button>
                </div>
                <div className="w-full">
                    <Button className="w-full" variant="secondary" onClick={() => setOpenDeleteTZ(true)}>
                        Перераспределить кольца
                    </Button>
                </div>
                <div className="w-full">
                    <Button className="w-full" variant="secondary" onClick={() => setOpenDeleteGov(true)}>
                        Удалить по атаке
                    </Button>
                </div>
                <div className="w-full">
                    <Button className="w-full" variant="secondary" onClick={() => open('https://www.youtube.com/watch?v=PAvn_jBNVNE&list=PLFMhxiCgmMR9Pu0v-VjNdEaRLcoUqHLFT')}>
                        Гайд по Jakarta EE
                    </Button>
                </div>
                <div className="w-full">
                    <Button className="w-full" variant="secondary" onClick={() => open('https://cataas.com/cat')}>
                        Рандомный кот
                    </Button>
                </div>
            </div>

            <AddCityForm/>
            <GroupByCreatureTypeDialog
                open={openGroupByCreatureType}
                onOpenChange={setOpenGroupByCreatureType}
            />
            <UniqueDefenseLevelsDialog open={openMove} onOpenChange={setOpenMove}/>
            <StatsByUsers open={openHalf} onOpenChange={setOpenHalf}/>
            <DeleteByAttackLevelModal
                open={openDeleteGov}
                onOpenChange={setOpenDeleteGov}
                onSuccess={refresh}
            />
            <DistributeRings
                open={openDeleteTZ}
                onOpenChange={setOpenDeleteTZ}
                onSuccess={refresh}
            />
            <Table fullWidth/>
        </div>
    );
}
