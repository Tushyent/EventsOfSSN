import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Ensure they are a club admin
  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role !== 'club_admin' && userProfile?.role !== 'super_admin') {
    redirect("/");
  }

  // Get their events
  const query = supabase.from("events").select("id, title, status");
  if (userProfile.role !== 'super_admin') {
    query.eq("created_by", user.id);
  }
  
  const { data: events } = await query;
  const eventIds = events ? events.map(e => e.id) : [];

  // Fetch analytics for these events
  const { data: analytics } = await supabase
    .from("event_analytics")
    .select("event_id, metric_type")
    .in("event_id", eventIds);

  // Process data
  const metricsByEvent: Record<string, { views: number, clicks: number, title: string, status: string }> = {};
  
  if (events) {
    events.forEach(e => {
      metricsByEvent[e.id] = { views: 0, clicks: 0, title: e.title, status: e.status };
    });
  }

  let totalViews = 0;
  let totalClicks = 0;

  if (analytics) {
    analytics.forEach(a => {
      if (metricsByEvent[a.event_id]) {
        if (a.metric_type === 'view') {
          metricsByEvent[a.event_id].views++;
          totalViews++;
        }
        if (a.metric_type === 'click') {
          metricsByEvent[a.event_id].clicks++;
          totalClicks++;
        }
      }
    });
  }

  const overallConversionRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;
  const eventMetricsList = Object.values(metricsByEvent).sort((a, b) => b.views - a.views);

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track engagement and registration conversions for your events.</p>
        </div>
        <Link href="/admin/events/new" className={buttonVariants({ variant: "outline", className: "mt-4 md:mt-0 text-white border-white/20 hover:bg-white/10" })}>
          Post New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <Eye className="w-8 h-8 text-blue-400 mb-2" />
          <p className="text-sm text-gray-400 mb-1">Total Page Views</p>
          <p className="text-4xl font-bold text-white">{totalViews}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <MousePointerClick className="w-8 h-8 text-purple-400 mb-2" />
          <p className="text-sm text-gray-400 mb-1">Total Register Clicks</p>
          <p className="text-4xl font-bold text-white">{totalClicks}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
          <p className="text-sm text-gray-400 mb-1">Avg Conversion Rate</p>
          <p className="text-4xl font-bold text-white">{overallConversionRate}%</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-white">Performance by Event</h2>
        </div>
        
        {eventMetricsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/20 text-gray-400 text-sm">
                  <th className="px-6 py-4 font-medium">Event Title</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Views</th>
                  <th className="px-6 py-4 font-medium text-right">Clicks</th>
                  <th className="px-6 py-4 font-medium text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {eventMetricsList.map((em, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{em.title}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider ${em.status === 'approved' ? 'bg-green-500/20 text-green-300' : em.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                        {em.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">{em.views}</td>
                    <td className="px-6 py-4 text-right text-gray-300">{em.clicks}</td>
                    <td className="px-6 py-4 text-right font-medium text-white">
                      {em.views > 0 ? Math.round((em.clicks / em.views) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No events found. Start posting events to see analytics!
          </div>
        )}
      </div>
    </div>
  );
}
