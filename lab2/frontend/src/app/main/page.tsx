'use client';

import {Button, PageHeader, PageHeaderHeading} from "@/shared/ui-toolkit";
import Image from "next/image";
import Link from "next/link";
import {useAuthContext} from "@/app/utilities";
import Table from "@/shared/ui-toolkit/table";
import React, {useState, useRef} from "react";
import AddCityForm from "@/shared/ui-toolkit/add-book-creature";
import {createTestObjects} from "@/app/utilities/providers/auth-provider/api-layer";
import {useTokenRotation} from "@/app/utilities/providers/auth-provider/useTokenRotation";
import DeleteByAttackLevelModal from "@/shared/ui-toolkit/delete-by-attack-level";
import DistributeRings from "@/shared/ui-toolkit/distribute-rings";
import StatsByUsers from "@/shared/ui-toolkit/stats-by-users";
import UniqueDefenseLevelsDialog from "@/shared/ui-toolkit/unique-defense-level";
import GroupByCreatureTypeDialog from "@/shared/ui-toolkit/group-by-creature-group";
import CSVImportDialog from "@/shared/ui-toolkit/csv-import";

export default function MainPage() {
    const {user} = useAuthContext();
    const [openHalf, setOpenHalf] = useState(false);
    const [openMove, setOpenMove] = useState(false);
    const [openDeleteGov, setOpenDeleteGov] = useState(false);
    const [openDeleteTZ, setOpenDeleteTZ] = useState(false);
    const [openGroupByCreatureType, setOpenGroupByCreatureType] = useState(false);
    const [openCSVImport, setOpenCSVImport] = useState(false);
    const [showCatHover, setShowCatHover] = useState(false);
    const [catImageUrl, setCatImageUrl] = useState('https://cataas.com/cat');
    const refresh = () => {
    };

    const updateCatImage = () => {
        setCatImageUrl(`https://cataas.com/cat?t=${Date.now()}`);
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
                    <Button className="w-full" variant="secondary" onClick={() => setOpenCSVImport(true)}>
                        Импорт CSV <b> NEW</b>
                    </Button>
                </div>
                <div className="w-full relative">
                    <Button 
                        className="w-full" 
                        variant="secondary" 
                        onMouseEnter={() => {
                            setShowCatHover(true);
                            updateCatImage();
                        }}
                        onMouseLeave={() => setShowCatHover(false)}
                    >
                        Рандомный кот
                    </Button>
                    {showCatHover && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white rounded-lg shadow-xl border p-2">
                            <Image
                                src={catImageUrl}
                                alt="Random cat"
                                width={300}
                                height={300}
                                className="rounded-lg object-cover"
                                onError={() => setCatImageUrl('https://cataas.com/cat')}
                                unoptimized={true}
                            />
                        </div>
                    )}
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
            <CSVImportDialog
                open={openCSVImport}
                onOpenChange={setOpenCSVImport}
            />
            <Table/>
        </div>
    );
}
