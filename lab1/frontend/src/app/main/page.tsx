'use client';

import {Button, PageHeader, PageHeaderDescription, PageHeaderHeading} from "@/shared/ui-toolkit";
import Image from "next/image";
import Link from "next/link";
import {useAuthContext} from "@/app/utilities";
import Table from "@/shared/ui-toolkit/table";
import React from "react";
import AddCityForm from "@/shared/ui-toolkit/add-city";

export default function MainPage() {
    const {user} = useAuthContext();

    if (!user) {
        return (
            <div className="flex flex-col py-10 gap-20">
                <PageHeader className='text-center items-center'>
                    <Image src="/catjail.jpg" alt="Default our app user" className='mb-5' width={200} height={100}/>
                    <PageHeaderHeading className="hidden md:block">You are unauthorized</PageHeaderHeading>
                    <PageHeaderHeading className="md:hidden">Too small</PageHeaderHeading>
                    <PageHeaderDescription>
                        This cat cant pass through the jail bars<br/>
                        And you cant use this app without authorization<br/>
                        Create an account or login with button below
                    </PageHeaderDescription>
                    <Link href="/auth/login?redirect=/main">
                        <Button variant='default' className='mt-5 scale-125' type='button'>Login / Signup</Button>
                    </Link>
                </PageHeader>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 py-6">
            <AddCityForm/>
            <Table fullWidth/>
        </div>
    );
}
