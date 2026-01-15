import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { WhyBodyWiseSection } from "@/components/sections/why-bodywise";
import { CoreFeaturesSection } from "@/components/sections/core-features";
import { TestimonialsSection } from "@/components/sections/testimonials";


export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'AEON Academy',
                        url: 'https://www.aeon-academy.com',
                        logo: 'https://www.aeon-academy.com/favicon.ico',
                        sameAs: [
                            'https://twitter.com/aeonacademy',
                            'https://facebook.com/aeonacademy',
                            'https://instagram.com/aeonacademy'
                        ],
                        description: 'Premier English Learning Platform connecting students with expert teachers.'
                    })
                }}
            />
            <Navbar />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
                <HeroSection />
                <WhyBodyWiseSection />
                <CoreFeaturesSection />
                <TestimonialsSection />
            </main>
            <Footer />
        </div>
    );
}
