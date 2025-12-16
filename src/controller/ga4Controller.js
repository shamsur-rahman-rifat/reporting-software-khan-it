import axios from "axios";
import cron from "node-cron";
import ga4Model from "../model/GA4Report.js";
import projectModel from "../model/Project.js"; 
import dayjs from "dayjs";

const getPreviousMonthRange = () => {
  const now = dayjs();
  const start = now.subtract(1, "month").startOf("month").format("YYYY-MM-DD");
  const end = now.subtract(1, "month").endOf("month").format("YYYY-MM-DD");
  return { start, end };
};

export const fetchAndSaveGA4 = async (req, res) => {
  try {
    const baseUrl = "https://google-analytics-api.onrender.com";
    const { start, end } = getPreviousMonthRange();
    const month = dayjs(start).format("MMM-YY");

    let awake = false;

    for (let i = 1; i <= 10; i++) { // Try up to 10 times
      try {
        const response = await axios.get(baseUrl, { timeout: 5000 });
        if (response.status < 500) {
          awake = true;
          break;
        }
      } catch (err) {
        await new Promise(r => setTimeout(r, 10000)); // Wait 10 seconds
      }
    }

    if (!awake) {
      const message = "⚠️ Render service did not wake up after multiple attempts.";
      if (res) return res.json({ status: "Failed", message });
      console.warn(message);
      return;
    }

    const projects = await projectModel.find();
    if (!projects.length)
      return res.json({ status: "Failed", message: "No projects found" });

    let totalAdded = 0;

    for (const project of projects) {
      const propertyId = project.propertyId;
      if (!propertyId) continue;

      const apiUrl = `${baseUrl}/analytics?property_id=${propertyId}&start_date=${start}&end_date=${end}`;

      const { data } = await axios.get(apiUrl);

      if (!data || data.status !== "success") {
        console.warn(`⚠️ Failed to fetch data for project ${project._id}`);
        continue;
      }

      // 🧮 Only keep top 5 countries
      const sortedCountries = Object.entries(data.traffic_country)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const top5Countries = Object.fromEntries(sortedCountries);      

      const formatted = {
        project: project._id,
        month,
        metrics: {
          users: data.metrics.users,
          new_users: data.metrics.new_users,
          avg_engagement_time_seconds: data.metrics.avg_engagement_time_seconds,
        },
        traffic_source: data.traffic_source,
        traffic_country: top5Countries,
        traffic_device: data.traffic_device,
      };

      // ✅ Use upsert to avoid duplicates
      await ga4Model.findOneAndUpdate(
        { project: project._id, month },
        formatted,
        { upsert: true, new: true }
      );

      totalAdded++;
    }

    const message = `${totalAdded} GA4 report(s) saved for ${month} (${start} → ${end})`;
    if (res) res.json({ status: "Success", message });
    else console.log("✅", message);

  } catch (error) {
    const message = error.message || "Something went wrong while fetching GA4 data";
    if (res) res.json({ status: "Failed", message });
    else console.error("❌ GA4 Fetch Error:", message);
  }
};

export const viewGA4ByProject = async (req, res) => {
  try {
    const { id } = req.params;
    const reports = await ga4Model.find({ project: id }).sort({ createdAt: -1 });
    res.json({ status: "Success", data: reports });
  } catch (error) {
    res.json({ status: "Failed", message: error.message || error });
  }
};

cron.schedule("0 0 1 * *", async () => {
  console.log("🚀 Running automatic monthly GA4 fetch...");
  await fetchAndSaveGA4(); // auto fetch without req/res
});