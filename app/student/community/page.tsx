import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { communityStories } from "@/lib/dashboard-data";
import { TESTIMONIALS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { studentNav } from "@/lib/navigation";

export default function UserCommunityPage() {
  return (
    <DashboardShell
      title="Community stories & reflections"
      subtitle="Read peer experiences, celebrate milestones, and share your own Education journey with AEON."
      breadcrumbs={[
        { label: "User", href: "/user" },
        { label: "Community" },
      ]}
      navItems={studentNav}
    >
      <section className="rounded-3xl border border-gray-300 bg-white p-6 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-900">
          Peer testimonials
        </h3>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.name}
              className="flex flex-col gap-4 rounded-2xl bg-gray-50 px-4 py-5 text-gray-800"
            >
              <div>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-gray-600">{testimonial.location}</p>
              </div>
              <p className="text-sm text-gray-700">“{testimonial.quote}”</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5 rounded-3xl border border-gray-300 bg-white p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-900">
            Spotlight stories
          </h3>
          <div className="space-y-4">
            {communityStories.map((story) => (
              <article
                key={story.title}
                className="rounded-2xl bg-gray-50 px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {story.readTime}
                </p>
                <h4 className="mt-2 text-base font-semibold text-gray-900">
                  {story.title}
                </h4>
                <p className="text-sm text-gray-700">{story.excerpt}</p>
                <p className="mt-2 text-xs text-gray-600">
                  Shared by {story.author}
                </p>
              </article>
            ))}
          </div>
        </div>
        <form className="space-y-4 rounded-3xl border border-gray-300 bg-white p-6 shadow-lg">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Share your reflection
            </h3>
            <p className="text-xs text-gray-600">
              Your story encourages other students navigating their education journey.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="story-title" requiredIndicator>
              Title
            </Label>
            <input
              id="story-title"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="What inspired you this week?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="story" requiredIndicator>
              Story
            </Label>
            <textarea
              id="story"
              rows={6}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Share your journey, breakthroughs, or encouragement for others."
            />
          </div>
          <Button type="submit" variant="secondary" className="w-full">
            Publish to community blog
          </Button>
        </form>
      </section>
    </DashboardShell>
  );
}