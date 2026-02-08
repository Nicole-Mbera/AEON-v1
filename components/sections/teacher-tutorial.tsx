import { SectionHeading } from "@/components/ui/section-heading";

export function TeacherTutorialSection() {
    return (
        <section
            id="teacher-tutorial"
            className="rounded-[36px] bg-white px-8 py-20 shadow-[0_35px_80px_-60px_rgba(0,0,0,0.1)] sm:px-12 lg:px-16"
        >
            <SectionHeading
                eyebrow="For Teachers"
                title="Start Your Teaching Journey"
                description="Watch this quick tutorial to learn how to sign up, create your profile, and begin teaching on AEON Academy."
                align="center"
                className="mb-14"
                variant="light"
            />
            <div className="mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg">
                <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/g658Rygj9MU"
                    title="Teacher Onboarding Tutorial"
                    className="border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
            <p className="mt-4 text-center text-sm text-gray-500">
                Having trouble viewing the video? <a href="https://www.youtube.com/watch?v=g658Rygj9MU" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Watch on YouTube</a>
            </p>
        </section>
    );
}
