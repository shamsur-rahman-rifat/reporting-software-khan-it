import webVitalModel from '../model/WebVital.js';
import projectModel from '../model/Project.js';

// Add new Web Vital Report
export const addWebVitalReport = async (req, res) => {
  try {
    const { project, platform, poorUrls, improvementUrls, goodUrls } = req.body;

    // Generate report month
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    // Validate project existence
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    // Check if a report already exists for this project & month & platform
    const existingReport = await webVitalModel.findOne({ project, reportMonth, platform });
    if (existingReport) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Web Vital report already exists for this project, month, and platform'
      });
    }

    // Create new Web Vital report
    const newReport = new webVitalModel({
      project,
      platform,
      poorUrls: poorUrls || 0,
      improvementUrls: improvementUrls || 0,
      goodUrls: goodUrls || 0,
      reportMonth
    });

    await newReport.save();

    res.json({ status: 'Success', message: 'Web Vital Report Added' });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View all Web Vital Reports
export const viewAllWebVitalReports = async (req, res) => {
  try {
    const reports = await webVitalModel.find().populate('project', 'website');
    res.json({ status: 'Success', data: reports });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View Web Vital Reports by Project
export const viewWebVitalReportsByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectExists = await projectModel.findById(id);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    const reports = await webVitalModel.find({ project: id }).sort({ createdAt: -1 });

    res.json({ status: 'Success', data: reports });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// Update Web Vital Report
export const updateWebVitalReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReport = await webVitalModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedReport) {
      return res.status(404).json({ status: 'Failed', message: 'Web Vital Report not found' });
    }

    res.json({
      status: 'Success',
      message: 'Web Vital Report Updated',
      data: updatedReport
    });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// Delete Web Vital Report
export const deleteWebVitalReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await webVitalModel.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({ status: 'Failed', message: 'Web Vital Report not found' });
    }

    res.json({ status: 'Success', message: 'Web Vital Report Deleted' });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};