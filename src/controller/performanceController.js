import axios from "axios";
import cron from "node-cron";
import projectModel from "../model/Project.js";
import performanceModel from "../model/Performance.js";

// Helper: Validate and normalize URL
const normalizeUrl = (url) => {
  try {
    // Add protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    
    // Validate URL format
    const urlObj = new URL(url);
    return urlObj.href;
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`);
  }
};

// Helper function: extract metrics from Lighthouse response
const extractMetrics = (lhr) => {
  if (!lhr) {
    return {
      score: 0,
      fcp: "0 s",
      lcp: "0 s",
      tbt: "0 ms",
      cls: "0",
      si: "0 s",
    };
  }

  const audits = lhr.audits || {};
  const categories = lhr.categories || {};

  return {
    score: (categories.performance?.score || 0) * 100,
    fcp: audits["first-contentful-paint"]?.displayValue || "0 s",
    lcp: audits["largest-contentful-paint"]?.displayValue || "0 s",
    tbt: audits["total-blocking-time"]?.displayValue || "0 ms",
    cls: audits["cumulative-layout-shift"]?.displayValue || "0",
    si: audits["speed-index"]?.displayValue || "0 s",
  };
};

// 📌 MAIN FUNCTION
export const fetchMonthlyPerformance = async (req, res) => {
  try {
    // 1️⃣ Get all ongoing projects
    const projects = await projectModel.find({ status: "ongoing" });

    if (!projects.length) {
      if (res)
        return res.json({ status: "Success", message: "No ongoing projects found" });
      console.log("⚠️ No ongoing projects found");
      return;
    }

    const API_KEY = process.env.PSI_API_KEY;

    // Generate report month
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    let totalReports = 0;
    let totalUpdated = 0;
    const errors = [];

    // 2️⃣ Iterate over each project
    for (const project of projects) {
      try {
        const url = normalizeUrl(project.website);
        console.log(`📊 Analyzing: ${url}`);

        const platforms = ["mobile", "desktop"];

        for (const platform of platforms) {
          try {
            const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`;
            
            const response = await axios.get(psiUrl, {
              params: {
                url: url, 
                strategy: platform.toUpperCase(),
                key: API_KEY,
              }
            });

            const lhr = response.data?.lighthouseResult;

            if (!lhr) {
              console.warn(`⚠️ No lighthouse data for ${url} (${platform})`);
              continue;
            }

            // 3️⃣ Extract required metrics
            const metrics = extractMetrics(lhr);

            // 4️⃣ Save into DB
            const existingReport = await performanceModel.findOne({
              project: project._id,
              platform: platform === "mobile" ? "Mobile" : "Desktop",
              reportMonth: reportMonth,
            });

            const reportData = {
              project: project._id,
              platform: platform === "mobile" ? "Mobile" : "Desktop",
              score: metrics.score,
              fcp: metrics.fcp,
              lcp: metrics.lcp,
              tbt: metrics.tbt,
              cls: metrics.cls,
              si: metrics.si,
              reportMonth,
            };            

            if (existingReport) {
              // ✅ Update existing report
              await performanceModel.findByIdAndUpdate(
                existingReport._id,
                reportData,
                { new: true }
              );
              totalUpdated++;
              console.log(`🔄 Updated: ${url} (${platform}) - Score: ${metrics.score}`);
            } else {
              // ✅ Create new report
              await performanceModel.create(reportData);
              totalReports++;
              console.log(`✅ Created: ${url} (${platform}) - Score: ${metrics.score}`);
            }

          } catch (platformError) {
            const errMsg = `Failed ${platform} analysis for ${url}: ${platformError.response?.data?.error?.message || platformError.message}`;
            console.error(`❌ ${errMsg}`);
            errors.push(errMsg);
            continue;
          }
        }
      } catch (projectError) {
        const errMsg = `Failed to process project ${project._id}: ${projectError.message}`;
        console.error(`❌ ${errMsg}`);
        errors.push(errMsg);
        continue;
      }
    }

    const message = `Successfully added ${totalReports} performance report(s).${
      errors.length ? ` ${errors.length} error(s) occurred.` : ""
    }`;

    if (res) {
      res.json({
        status: totalReports > 0 ? "Success" : "Partial Failure",
        message,
        totalReports,
        errors: errors.length ? errors : undefined,
      });
    } else {
      console.log(`✅ ${message}`);
    }
  } catch (error) {
    const msg = error.message || "Something went wrong during PSI fetch";
    console.error("❌ Performance Fetch Error:", error);
    
    if (res) {
      res.status(500).json({ status: "Failed", message: msg });
    } else {
      console.error("❌ Performance Fetch Error:", msg);
    }
  }
};

export const viewPerformanceReports = async (req, res) => {
  try {
    const result = await performanceModel
      .find()
      .populate('project', 'website')
      .sort({ createdAt: -1 });

    res.json({ status: "Success", data: result });
  } catch (error) {
    res.json({ status: "Failed", message: error.message || error });
  }
};

export const viewPerformanceByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await performanceModel
      .find({ project: projectId })
      .sort({ createdAt: -1 });

    res.json({ status: "Success", data: result });
  } catch (error) {
    res.json({ status: "Failed", message: error.message || error });
  }
};

// 🕒 Monthly Cron Job

cron.schedule("0 0 1 * *", async () => {
  console.log("🚀 Running automatic Monthly Performance Fetch...");
  await fetchMonthlyPerformance();
});