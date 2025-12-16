import reputationModel from "../model/Reputation.js";
import projectModel from "../model/Project.js";

// Add new Reputation Report
export const addReputationReport = async (req, res) => {
  try {
    const { project, platform, totalReviews } = req.body;

    // Generate months
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const previousDate = new Date(now);
    previousDate.setMonth(previousDate.getMonth() - 1);
    const previousMonth = previousDate.toLocaleString("en-US", { month: "long", year: "numeric" });

    // Validate project existence
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Project not found" });
    }

    // Check if report already exists for project + month + platform
    const existingReport = await reputationModel.findOne({ project, reportMonth, platform })

    if (existingReport) {
      return res.status(400).json({
        status: "Failed",
        message:
          "Reputation report already exists for this project, month, and platform",
      });
    }

    // Get previous month's report
    const previousReport = await reputationModel.findOne({
      project,
      platform,
      reportMonth: previousMonth,
    });

    const previousTotal = previousReport?.totalReviews || 0;

    // Auto calculate reviewUpdates
    const reviewUpdates = totalReviews - previousTotal;    

    // Create new Reputation Report
    const newReport = new reputationModel({
      project,
      platform,
      totalReviews: totalReviews || 0,
      reviewUpdates,
      reportMonth,
    });

    await newReport.save();

    res.json({
      status: "Success",
      message: "Reputation Report Added",
      data: {
        platform,
        totalReviews,
        reviewUpdates,
      },
    });
  } catch (error) {
    res.json({ status: "Failed", message: error.message });
  }
};

// View all Reputation Reports
export const viewAllReputationReports = async (req, res) => {
  try {
    const reports = await reputationModel
      .find()
      .populate("project", "website");

    res.json({ status: "Success", data: reports });
  } catch (error) {
    res.json({ status: "Failed", message: error.message });
  }
};

// View Reputation Reports by Project
export const viewReputationReportsByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectExists = await projectModel.findById(id);
    if (!projectExists) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Project not found" });
    }

    const reports = await reputationModel
      .find({ project: id })
      .sort({ createdAt: -1 });

    res.json({ status: "Success", data: reports });
  } catch (error) {
    res.json({ status: "Failed", message: error.message });
  }
};

// Update Reputation Report
export const updateReputationReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalReviews, ...rest } = req.body;

    // Find current report
    const currentReport = await reputationModel.findById(id);
    if (!currentReport) {
      return res.status(404).json({
        status: "Failed",
        message: "Reputation Report not found",
      });
    }

    let reviewUpdates = currentReport.reviewUpdates;

    // If totalReviews is being updated → recalculate
    if (typeof totalReviews === "number") {
      // Get previous month
      const currentDate = new Date(currentReport.createdAt);
      const prevDate = new Date(currentDate);
      prevDate.setMonth(prevDate.getMonth() - 1);

      const previousMonth = prevDate.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      // Find previous month report
      const previousReport = await reputationModel.findOne({
        project: currentReport.project,
        platform: currentReport.platform,
        reportMonth: previousMonth,
      });

      const previousTotal = previousReport?.totalReviews || 0;
      reviewUpdates = totalReviews - previousTotal;
    }

    // Update report
    const updatedReport = await reputationModel.findByIdAndUpdate(
      id,
      {
        ...rest,
        ...(typeof totalReviews === "number" && { totalReviews }),
        reviewUpdates,
      },
      { new: true }
    );

    res.json({
      status: "Success",
      message: "Reputation Report Updated",
      data: updatedReport,
    });
  } catch (error) {
    res.json({ status: "Failed", message: error.message });
  }
};

// Delete Reputation Report
export const deleteReputationReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await reputationModel.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({
        status: "Failed",
        message: "Reputation Report not found",
      });
    }

    res.json({
      status: "Success",
      message: "Reputation Report Deleted",
    });
  } catch (error) {
    res.json({ status: "Failed", message: error.message });
  }
};