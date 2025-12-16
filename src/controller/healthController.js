import healthModel from '../model/HealthReport.js';
import projectModel from '../model/Project.js';

// Add new Health Report
export const addHealthReport = async (req, res) => {
  try {
    const { project, gsc, security, httpsUrls, nonHttpsUrls } = req.body;

    // Generate report month
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    // Validate project existence
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    // Check if a report already exists for this project & month
    const existingReport = await healthModel.findOne({ project, reportMonth });
    if (existingReport) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Health report already exists for this project and month'
      });
    }

    // Create new health report
    const newReport = new healthModel({
      project,
      gsc: gsc || 'No manual actions required',
      security: security || 'No security issues detected',
      httpsUrls: httpsUrls || 0,
      nonHttpsUrls: nonHttpsUrls || 0,
      reportMonth
    });

    await newReport.save();

    res.json({ status: 'Success', message: 'Health Report Added' });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View all Health Reports
export const viewAllHealthReports = async (req, res) => {
  try {
    const reports = await healthModel.find().populate('project', 'website');
    res.json({ status: 'Success', data: reports });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View Health Reports by Project
export const viewHealthReportsByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectExists = await projectModel.findById(id);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    const reports = await healthModel.find({ project: id }).sort({ createdAt: -1 });

    res.json({ status: 'Success', data: reports });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// Update Health Report
export const updateHealthReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReport = await healthModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedReport) {
      return res.status(404).json({ status: 'Failed', message: 'Health Report not found' });
    }

    res.json({
      status: 'Success',
      message: 'Health Report Updated',
      data: updatedReport
    });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};


// Delete Health Report
export const deleteHealthReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await healthModel.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({ status: 'Failed', message: 'Health Report not found' });
    }

    res.json({ status: 'Success', message: 'Health Report Deleted' });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};