'use client';

import { Button, PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/shared/ui-toolkit';
import { APP_CONFIG } from '@/shared/constants';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sounds = [
  'https://www.myinstants.com/instant/privet-pupsik-19085/embed/',
  'https://www.myinstants.com/instant/nepravilno-poprobui-eshchio-ra/embed/',
  'https://www.myinstants.com/instant/spasibo-kloun-78286/embed/',
  'https://www.myinstants.com/instant/directed-by-robert-b-weide-451/embed/'
];

const nicknames = [
  'ManRay', 'Marv1n', 'MegaCraTex', 'oTvErTk@1337', 'SLoŴMasteŘ', 'SpRiTe_LiMe',
  'ZnB ! .oO Cobi Oo', '[PRO]Fanta', '✪Awemy', '3JlOU_LLIKOJliK', '82)ne4eH`ka*(m)',
  'aimbat;j', 'IIuHgBuH', 'Mazer', 'the FirSssT«...', 'The_Aim_SNOW', 'Tractor',
  'xaTAbu4', 'aN00Bis', 'Mr.klubni4k@', 'PACMAN', 'The(Best)olo4b', 'THE BLOODY KNIGHT',
  'XaNaX', 'ЛоВи_В_ЛоБ', '4ebyrator', '6yka!?', '6yM_6yM', 'Aim4ik228',
  'BENNY/H DOMINATOR', 'BOND 007', 'HaPP_HeAdShOt', 'K.A.P.T.O.S.H.K.A',
  'Kharkov# RaKFoRd', 'KirKa', 'KomaN', 'Mairon', 'Mr_Boom', 'Po4ka',
  'PoZiTiV4iK :3', 'PR!ZRAK', 'SKORPION', 'Skrizy', 'ЗАdroТ', 'ЙОЖЫК',
  '[SA]TaTy[Pa]L*', '|D.F|™| |MEGA BoT™|', '500kg=)', '1ta4i0_0', 'BkoHTpe',
  'Cu6upckoe He4to', 'eXtreme', 'f0rest', 'KILLSHOT', 'KrAsAv4K', 'LeGenDa',
  'Mr_R.I.P', 'NooK', 'OVERLORD', 'Pro100CkiLL', 'XaMeJleoH', 'XuL[i]gaN4eG',
  'Пулька в лоб', 'Пульку_В_Попульку', '[Uzbek_tm]^βøśś', 'βолченоk', '**StaLkeR**',
  '-Durak-', '.#make.believe?', '.watch0ut__dk?', '0гYp4Иk', '79)m0NesY', '4',
  'Acid', 'angel of death', 'AT0M', 'BABKA HA IIOIIE', 'Babka Zina', 'BOOM',
  'BryHid3e.!!! !!!', 'cheK^', 'coco?', 'D@N!La', 'Derm', 'DeRzKuU', 'edeko',
  'FLESH', 'FOOLYOU', 'furyy =**', 'Game Killer', 'Lagger', 'Ma$ter X',
  'MisterWizard', 'Nice-ShoT-Hed-Show', 'OJIiMIIiK', 'One_Shot_pro', 'P1xeLe',
  'Parakon', 'Prosto_Toxa', 'RaNd0M_ShOT', 'RayX', 'reat!ve', 'Rennix',
  'Serial killer', 'Sliper', 'The-PRO', 'TpoJIb', 'Vol4onok', 'КотВаська',
  'милый_кот', 'Нович_оk', 'Сlark', 'ШоРт И мОй ХеДшОт', '[[freak]]',
  'ĤĒ_ÝMÊŮ_ĈŦPÊĴI9Ťb', '(Be$Kuda)Unikorn|DreamHack', ')*(OPA_y_EnOTa',
  '-DR-He-He-Hedshot', '4ebure4ek', '4uTeP', 'Acid_king', 'AFK', 'ALKACH',
  'Apple x all sucK', 'B4it``dk__18+', 'bRun0', 'CHAMPIK', 'Dark Evil',
  'DINOSOWER', 'DJ_HEAD-->>', 'easy frag', 'Fęñĭҳ', 'F4nt4st', 'FastMen',
  'Flynewers', 'FroZen*^^)', 'G9ce^AbRicoSic', 'Ghost_black', 'GoAndWin',
  'IseLegend', 'Kiling-Spree', 'KillNote#', 'Kobra', 'Kor~дAH4Ik',
  'KuKu_T_T_KuKu', 'Laaa PeRke?...', 'LaL()Cka', 'LEGEND_8D', 'Limyr4ik',
  'Lol aim Ban', 'M9TA', 'M@₦€₮ȆȐ', 'MaJIeHbkuu Prince', 'Mazafacker',
  'MaZaHaKa', 'MeGa_KiLL', 'Mr.DooRs', 'Mr.mentos', 'MuTanT', 'NGB',
  'night terrors', 'OnEshoT', 'P1ngv1n', 'pRo_O  3', 'Rayden',
  'ReacktioN MonGoose', 'S.E.C.T.O.R', 'Skeletik', 'Smiley', 'Snappi',
  'Storm', 'weltkind', 'xB1ood', 'Your Die', 'БаБуИн', 'ОН ЧИТЕР ПАЦАНЫ',
  'ПоСтоРониСь БаТя С КаЛаШоМ ИдЁт', 'ПуЛя_От_БаБуЛи', 'ШАВЕРМА', 'ЯрмаК',
  '[FPS] Infernus [FPS]', '[LG]-L.O.G.O.P.E.D-[LG]', '~Dosherak~',
  'Ťĥē_Tøp_ĻĮĐēŔ', '3JloI~banan', '@!Banan!@', '@KoPyLoV', 'A$TRO',
  'Aim4ERskiy', 'AKA', 'Assassins Creed', 'A_pLaYeR_ fRoM_ GoDツ', 'B@RD@N',
  'BaMnup c Amnup', 'BeЛUKuЙ', 'CJlaB9lHuH', 'Cozmo', 'Crazy_Dragon',
  'CTAJLKEP', 'Cydelix', 'Dakidlos', 'Dark_Assassin', 'Delirious', 'DELMAS',
  'DELphin4IK', 'dimarai', 'Dj.HaOs', 'Dreamy', 'Drumer', 'DUBERMAN',
  'D[e]N[i]$[o]K', 'efes', 'eJIekTpuK', 'ESKETIIT', 'F.A.C.E.B.OO.K',
  'F1rstAfterME', 'FaPToBa9i Dev4ono4ka', 'Fen1x Show', 'FhanTom', 'fokusNIK',
  'Game_PRO', 'GARRI_POTTER', 'GEOSOLD', 'Gerain4iK', 'GNOM', 'Golliaf',
  'Gre4A', 'GriDer', 'HARD-SKILL', 'HaRnA_ElbF_WWE', 'HazarD',
  'He3gopoBbIu_ncuX', 'Headhot', 'HEDSHOTER', 'I 1ove sp1nner', 'icemaN^',
  'Ice[One]_LoVe-1shot', 'IMPOSSIB[L]E P[L]AYER', 'Joker_KZ',
  'K.u.c.k.a-Jl.A.p.u.c.k.a', 'Karasik47', 'KekOfMeister', 'kn!ght',
  'KOCMO_KEKC', 'KrYsHuTeL', 'Kubik', 'LegIOneR', 'Lika A βøśś', 'Lonely',
  'MaFiaaa', 'Major', 'MakeBeNN', 'Marroko', 'MaXweLL', 'Meow',
  'Mr.KillerMan', 'Mr.Twix', 'Mr_KREG', 'Murrr', 'M_U_Z_O_N', 'N00p',
  'Nagibatou', 'NEVEMINJ', 'Ogis', 'Ogur4ik', 'OxoTHik', 'Püмά', 'Pipidone',
  'pro100velik288', 'PYCaim', 'PySiK', 'Report', 'Richi', 's.o.l.d.a.t',
  'SAMSUNGGGGGGGG', 'SelfEx', 'Shizzo Inside', 'SiKaMaNa', 'SmokeZeus',
  'SneekZ', 'SparcO', 'Static_X', 'suprimechik', 'T4WER', 'Tamatozzik',
  'TERL1MBOMBOM', 'TpaByIIIKa', 'wex3', 'whOo', 'X-24', 'XoRoIIIuu',
  'Xuila', 'XyLiGaN-142RuS', 'YFI', 'zyzik', 'Генерал', 'ДЕД БОМ БОМ',
  'Лада_Седан_Баклажан', 'ЛиКвИдАтОр'
];

function SoundButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      {sounds.map((src, i) => (
        <iframe
          key={i}
          src={src}
          width={110}
          height={100}
          style={{ position: 'relative', zIndex: 100000 }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [nickname, setNickname] = useState(nicknames[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setNickname(nicknames[Math.floor(Math.random() * nicknames.length)]);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col py-10 gap-20">
      <PageHeader className="text-center items-center">
        <PageHeaderHeading className="hidden md:block">
          {APP_CONFIG.name}
        </PageHeaderHeading>
        <PageHeaderHeading className="md:hidden">
          {APP_CONFIG.name}
        </PageHeaderHeading>
        <PageHeaderDescription>
          {APP_CONFIG.description} при поддержке {nickname}
        </PageHeaderDescription>
        <Link href="/main">
          <Button variant="default" className="scale-125 mt-5" type="button">
            Получить психологическую помощь
          </Button>
        </Link>
      </PageHeader>

      <Image
        src="/jakartaee.png"
        alt="Default our app user"
        width={10000}
        height={1000}
      />

      <div className="absolute top-1/2 left-1/2 translate-y-[+180%] translate-x-[10%]">
        <SoundButtons />
      </div>
    </div>
  );
}
