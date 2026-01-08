
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { getAvailableTeachers } from '@/lib/actions/teacher-actions';

export default async function TeachersPage() {
    const doctors = await getAvailableTeachers();

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">

                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Find your support team</h1>
                    <p className="text-lg text-black/70">Explore verified professionals and book sessions.</p>
                </div>

                {doctors.length === 0 ? (
                    <div className="rounded-3xl border border-black/20 bg-white p-12 text-center">
                        <p className="text-lg font-semibold text-black">No teachers found</p>
                        <p className="mt-2 text-sm text-black/70">Check back later for available professionals.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {doctors.map((doctor: any) => (
                            <div
                                key={doctor.id}
                                className="flex flex-col gap-4 rounded-3xl border border-black/20 bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[0_30px_80px_-50px_rgba(0,0,0,0.3)]"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black/5 text-lg font-semibold text-black overflow-hidden">
                                        {doctor.profile_image ? (
                                            <img src={doctor.profile_image} alt={doctor.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span>{doctor.full_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="text-lg font-semibold text-black">{doctor.full_name}</h3>
                                        <p className="text-sm text-black/70">{doctor.specialization}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-black/70 line-clamp-3">{doctor.bio}</p>

                                <div className="flex items-center gap-4 text-xs text-black/60">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 font-semibold text-white">
                                        Rating: {doctor.average_rating ? Number(doctor.average_rating).toFixed(1) : 'New'}
                                    </span>
                                    <span>{doctor.years_of_experience}+ years exp</span>
                                </div>

                                <Link href="/signup" className="mt-auto">
                                    <Button variant="secondary" className="w-full">
                                        Schedule
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
}
