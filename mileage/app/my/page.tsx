"use client";
import { ShoppingBag, LogOut, ChevronRight, Calendar, BookOpen, Target, HandHeart, ShieldCheck } from "lucide-react";
import Card from "@/components/Card";
import MileageDisplay from "@/components/MileageDisplay";
import StatCard from "@/components/StatCard";
import { useApp, useViewMode } from "@/lib/store-context";
import { requestTab } from "@/lib/tab";
import type { TabId } from "@/lib/types";

export default function MyContent() {
  const { student, isLoggedIn, logout, transactions } = useApp();
  const { setMode } = useViewMode();
  if (!student || !isLoggedIn) return null;

  const isAdmin = student.role === "teacher" || student.role === "admin" || student.isTeacher;

  const initialTxns = [
    { id: "it0", type: "QT 완료", description: "오늘의 QT", amount: 20, date: "2026-08-30" },
    { id: "it1", type: "주일예배 출석", description: "주일 예배", amount: 100, date: "2026-08-27" },
    { id: "it2", type: "Weekly Quest", description: "인사하기 미션", amount: 30, date: "2026-08-27" },
    { id: "it3", type: "기도 참여", description: "기도 참여", amount: 5, date: "2026-08-26" },
  ];

  const allTxns = [...initialTxns, ...transactions].slice(-8).reverse();

  return (
    <div>
      <div className="px-5 pt-7">
        <h1 className="text-xl font-bold text-neutral-900">MY</h1>
        <p className="mt-0.5 text-sm text-neutral-500">{student.name}님</p>
      </div>

      <section className="mt-3 px-5">
        <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-0 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-lg font-bold">{student.name[0]}</span>
            <div>
              <p className="text-lg font-bold">{student.name}</p>
              <p className="text-xs text-neutral-300">{myClassName(student.classId)}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-white/10 p-4">
            <p className="text-xs text-neutral-300">나의 마일리지</p>
            <MileageDisplay amount={student.mileage} />
          </div>
        </Card>
      </section>

      {isAdmin && (
        <section className="mt-5 px-5">
          <button
            onClick={() => setMode("admin")}
            className="flex w-full items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-left shadow-sm active:scale-[0.98] transition"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-white">
              <ShieldCheck size={22} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-indigo-800">관리자 페이지</p>
              <p className="text-xs text-indigo-500">학생/출석/미션/마일리지 관리</p>
            </div>
            <ChevronRight size={18} className="text-indigo-400" />
          </button>
        </section>
      )}

      <section className="mt-5 px-5">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="예배" value="4회" tone="emerald" icon={<Calendar size={14} />} />
          <StatCard label="QT" value="17회" tone="indigo" icon={<BookOpen size={14} />} />
          <StatCard label="미션" value="8개" tone="amber" icon={<Target size={14} />} />
          <StatCard label="기도" value="12회" tone="rose" icon={<HandHeart size={14} />} />
        </div>
      </section>

      <section className="mt-5 px-5">
        <h2 className="text-base font-bold text-neutral-900">마일리지 내역</h2>
        <div className="mt-3 flex flex-col gap-2">
          {allTxns.map((t) => (
            <Card key={t.id} className="!p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t.type}</p>
                  <p className="text-xs text-neutral-400">{t.date}</p>
                </div>
                <span className={`text-sm font-bold ${t.amount > 0 ? "text-indigo-600" : "text-neutral-400"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}M
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <h2 className="text-base font-bold text-neutral-900">내 기록</h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { label: "내 QT 기록", tab: "qt" as TabId },
            { label: "출석 기록", tab: "home" as TabId },
            { label: "획득한 배지", tab: "missions" as TabId },
            { label: "완료한 미션", tab: "missions" as TabId },
          ].map(item => (
            <button key={item.label} onClick={() => requestTab(item.tab)} className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-4 py-3.5 text-sm font-semibold text-neutral-700 shadow-sm active:scale-[0.98] transition">
              {item.label} <ChevronRight size={16} className="text-neutral-300" />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <Card className="border-amber-100 bg-amber-50/60">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-amber-500" />
            <h2 className="text-sm font-bold text-neutral-800">MILEAGE SHOP</h2>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">준비 중</span>
          </div>
          <p className="mt-1.5 text-xs text-amber-700">모은 마일리지로 특별한 보상을 만나보세요.</p>
        </Card>
      </section>

      <section className="mt-5 px-5 pb-6">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-bold text-neutral-500 active:scale-[0.98] transition"
        >
          <LogOut size={16} /> 로그아웃
        </button>
      </section>
    </div>
  );
}

function myClassName(classId: string) {
  const map: Record<string, string> = {
    c1: "고2-3반", c2: "고1-2반", c3: "고3-1반", c4: "고1-4반", c5: "고2-1반", c6: "고3-2반",
  };
  return map[classId] || "고등부";
}
