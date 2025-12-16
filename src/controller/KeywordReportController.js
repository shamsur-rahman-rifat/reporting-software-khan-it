import axios from "axios";
import cron from "node-cron";
import keywordModel from "../model/Keyword.js";
import projectModel from "../model/Project.js";
import keywordReportModel from "../model/KeywordReport.js";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

export const fetchAndSaveKeywordReports = async (req, res) => {
  try {
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const keywords = await keywordModel
      .find()
      .populate("project", "website");

    if (!keywords.length)
      return res.json({ status: "Failed", message: "No keywords found" });

    let totalAdded = 0;

    for (const kw of keywords) {
      const { _id, keyword, country, location, project } = kw;
      if (!keyword || !project) continue;

      // ✅ Use project name as domain
      const domain = project.website?.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

      const payload = {
        q: keyword,
        gl: (country || keyword?.country || "us").toLowerCase(),
        location: location || project?.country || "",
      };

      let foundPosition = null;
      let foundUrl = null;

      // ⭐ Search pages 1 → 10 (top 100)
      for (let page = 1; page <= 10; page++) {
        const config = {
          method: "post",
          url: "https://google.serper.dev/search",
          headers: {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json",
          },
          data: JSON.stringify({ ...payload, page }),
        };

        try {
          const { data } = await axios.request(config);
          const organicResults = data.organic || [];

          for (let i = 0; i < organicResults.length; i++) {
            const result = organicResults[i];

            if (result.link && result.link.toLowerCase().includes(domain)) {
              // If API provides position use that; else calculate
              foundPosition = result.position || (page - 1) * 10 + i + 1;
              foundUrl = result.link;
              break;
            }
          }

          if (foundPosition !== null) break; // Stop early if found

        } catch (err) {
          console.warn(
            `⚠️ Serper failed on page ${page} for "${keyword}": ${err.message}`
          );
        }
      }

        const position = foundPosition || "Not in top 100";

        // 🔥 STEP 1: Check if a report exists for this keyword + project + this month
        const existingReport = await keywordReportModel.findOne({
          keyword: _id,
          project: project._id,
          reportMonth,
        });

        if (existingReport) {
          console.log(`Skipping: Report already exists for ${keyword} (${reportMonth})`);
          continue;
        }   
        
        // 🔥 STEP 2: Get the very first report of this keyword
        const firstReport = await keywordReportModel.findOne({
          keyword: _id,
          project: project._id,
        }).sort({ createdAt: 1 });

        let previousPosition;
        let status;

        if (!firstReport) {
          // 🌟 FIRST MONTH DATA
          previousPosition = position;
          status = "N/A (first month)";
        } else {
          previousPosition = firstReport.previousPosition;

          // Compare numeric values if both are numeric
          const prevNum = parseInt(previousPosition);
          const currNum = parseInt(position);

          if (currNum < prevNum) {
            status = `Improved by ${prevNum - currNum} positions`;
          } else if (currNum > prevNum) {
            status = `Dropped by ${currNum - prevNum} positions`;
          } else {
            status = "No change";
          }
        }
        

        await keywordReportModel.create({
          keyword: _id,
          project: project._id,
          url: foundUrl,
          previousPosition,
          currentPosition: position,
          status,
          reportMonth,
        });

        totalAdded++;
      } 

    const message = `${totalAdded} keyword report(s) saved successfully`;
    if (res) res.json({ status: "Success", message });
    else console.log("✅", message);

  } catch (error) {
    const message =
      error.message || "Something went wrong while fetching keyword data";
    if (res) res.json({ status: "Failed", message });
    else console.error("❌ Keyword Fetch Error:", message);
  }
};      

/**
 * View all keyword reports for a given project
 */
export const viewKeywordReportsByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectExists = await projectModel.findById(id);
    if (!projectExists)
      return res.json({ status: "Failed", message: "Project not found" });

    const reports = await keywordReportModel
      .find({ project: id })
      .populate("keyword", "keyword")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json({ status: "Success", data: reports });
  } catch (error) {
    res.json({ status: "Failed", message: error.message });
  }
};

/**
 * Cron job → runs automatically on the 1st of every month at midnight
 */
cron.schedule("0 0 1 * *", async () => {
  console.log("🚀 Running automatic monthly Serper keyword report job...");
  await fetchAndSaveKeywordReports(); // No req/res for cron mode
});
