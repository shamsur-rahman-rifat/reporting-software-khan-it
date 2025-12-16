import mongoose from 'mongoose';
import projectModel from "../model/Project.js";

import OrganicReport from "../model/OrganicReport.js";
import Keyword from "../model/Keyword.js";
import GBPReport from "../model/GBPReport.js";
import Blog from "../model/Blog.js";
import HealthReport from "../model/HealthReport.js";
import OnPageReport from "../model/OnPageReport.js";
import SMMLink from "../model/SMMLink.js";
import Backlink from "../model/Backlink.js";

// 👁️ VIEW CURRENT MONTH REPORT SUMMARY BY PROJECT
export const viewCurrentMonthProjectSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check project
    const project = await projectModel.findById(id).select("website");
    if (!project) {
      return res.json({ status: "Failed", message: "Project not found" });
    }

    // ✅ Generate report month
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    // 🔹 Organic Growth
    const organic = await OrganicReport.findOne(
      { project: id, month: reportMonth },
      { traffic_source: 1, _id: 0 }
    ).lean();

    const organicGrowth = organic
      ? Object.values(organic.traffic_source || {}).reduce(
          (sum, val) => sum + val,
          0
        )
      : 0;

    // 🔹 Keyword Tracking
    const keywordTracking = await Keyword.countDocuments({
      project: id
    });

    // 🔹 GBP
    const gbp  = await GBPReport.findOne(
    { project: id, reportMonth },
    { totalInteractions: 1, _id: 0 }
    )

    const googleBusinessProfile = gbp?.totalInteractions || 0;

    // 🔹 Blogs
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const blog = await Blog.countDocuments({
      project: project.website,
      publishedAt: {
        $gte: startOfMonth.toISOString().split("T")[0],
        $lte: endOfMonth.toISOString().split("T")[0],
      },
    });

    // 🔹 Site Health (latest for this month)
    const health = await HealthReport.findOne(
      { project: id, reportMonth },
      {},
      { sort: { createdAt: -1 } }
    );

    let siteHealth = true; // default to true if no health report

    if (health) {
      siteHealth =
        health.gsc === 'No manual actions required' &&
        health.security === 'No security issues detected';
    }

    // 🔹 On-Page SEO (latest for this month)
    const onPageCount = await OnPageReport.countDocuments({
      project: id,
      reportMonth,
    });
    
    const onPageTechnicalSEO = onPageCount > 0 ? onPageCount : "Done";

    // 🔹 Social Media
    const smmLinks = await SMMLink.find({ project: id }).lean();

    const socialMedia = smmLinks.some(link => {
      if (!link.publishDate) return false;
      const date = new Date(link.publishDate); // converts "Dec 13, 2025" to Date object
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
      ? smmLinks.length
      : "No Work";

    // 🔹 Backlinks
    const backlinks = await Backlink.countDocuments({
      project: id,
      reportMonth,
    });

    // ✅ Final Response (NOT SAVED)
    res.json({
      status: "Success",
      data: {
        project,
        reportMonth,
        organicGrowth,
        keywordTracking,
        googleBusinessProfile,
        blog,
        siteHealth,
        onPageTechnicalSEO,
        socialMedia,
        backlinks,
      },
    });
  } catch (error) {
    res.json({
      status: "Failed",
      message: error.message || "Failed to generate report summary",
    });
  }
};
