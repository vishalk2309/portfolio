import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  job_type?: string;
  posted_date?: string;
  source: "devto" | "remoteok" | "manual";
  external_id?: string;
}

// Fetch from Dev.to Jobs API
async function fetchDevToJobs(): Promise<Job[]> {
  try {
    const response = await fetch(
      "https://dev.to/api/classified_listings?category=jobs&tags=remote"
    );
    if (!response.ok) throw new Error("Dev.to API failed");

    const listings = await response.json();
    return listings
      .filter((job: any) => job.body_markdown?.toLowerCase().includes("remote"))
      .slice(0, 20)
      .map((job: any) => ({
        title: job.title,
        company: job.user?.name || "Unknown",
        location: "Remote",
        url: `https://dev.to${job.path}`,
        description: job.body_markdown?.substring(0, 500),
        source: "devto",
        external_id: `devto_${job.id}`,
        posted_date: job.created_at,
      }));
  } catch (error) {
    console.error("Dev.to Jobs fetch failed:", error);
    return [];
  }
}

// Fetch from RemoteOK API
async function fetchRemoteOKJobs(): Promise<Job[]> {
  try {
    const response = await fetch("https://remoteok.com/api");
    if (!response.ok) throw new Error("RemoteOK API failed");

    const jobs = await response.json();
    return jobs
      .filter((job: any) => job.id !== "0" && job.position)
      .slice(0, 20)
      .map((job: any) => ({
        title: job.position,
        company: job.company,
        location: job.location || "Remote",
        url: job.url,
        description: job.description?.substring(0, 500) || job.position,
        job_type: "Remote",
        source: "remoteok",
        external_id: `remoteok_${job.id}`,
        posted_date: new Date(job.date_posted * 1000).toISOString(),
      }));
  } catch (error) {
    console.error("RemoteOK Jobs fetch failed:", error);
    return [];
  }
}

// Deduplicate jobs
function deduplicateJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

serve(async (req) => {
  try {
    console.log("Starting job fetch...");

    // Fetch from RemoteOK (Dev.to API endpoint is broken)
    const remoteokJobs = await fetchRemoteOKJobs();

    const allJobs = [...remoteokJobs];
    console.log(`Fetched ${allJobs.length} jobs total`);

    // Deduplicate
    const uniqueJobs = deduplicateJobs(allJobs);
    console.log(`${uniqueJobs.length} unique jobs after deduplication`);

    if (uniqueJobs.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store in database - update or insert
    const { error: insertError } = await supabase
      .from("job_updates")
      .upsert(
        uniqueJobs.map((job) => ({
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          job_type: job.job_type,
          apply_url: job.url,
          source: job.source,
          external_id: job.external_id,
          created_at: job.posted_date || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_auto_fetched: true,
        })),
        {
          onConflict: "external_id",
          ignoreDuplicates: false,
        }
      );

    if (insertError) throw insertError;

    console.log(`Stored ${uniqueJobs.length} jobs`);

    return new Response(
      JSON.stringify({
        success: true,
        count: uniqueJobs.length,
        sources: {
          remoteok: remoteokJobs.length,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
