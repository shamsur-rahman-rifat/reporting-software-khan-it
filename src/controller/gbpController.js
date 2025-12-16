import gbpModel from '../model/GBPReport.js'
import projectModel from '../model/Project.js';

// Add new GBP Report
export const addGbpReport = async (req, res) => {
  try {
    const { project, bookings, websiteVisits, calls, directions } = req.body;
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    // Validate project existence
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    // Check if a report already exists for the same project and month
    const existingReport = await gbpModel.findOne({ project, reportMonth });
    if (existingReport) {
      return res.status(400).json({ status: 'Failed', message: 'Report already exists for this project and month' });
    }
    
    // Calculate totalInteractions as the sum of other values
    const totalInteractions = (calls || 0) + (bookings || 0) + (websiteVisits || 0) + (directions || 0)

    // Create and save GBP report
    const newReport = new gbpModel({project,totalInteractions,bookings,websiteVisits,calls,directions,reportMonth});

    await newReport.save();
    res.json({ status: 'Success', message: 'GBP Report Added' });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View all GBP Reports
export const viewAllGbpReports = async (req, res) => {
  try {
    const reports = await gbpModel.find().populate('project', 'website');
    res.json({ status: 'Success', data: reports });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View GBP Reports by specific project
export const viewGbpReportsByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectExists = await projectModel.findById(id);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    const reports = await gbpModel.find({ project: id }).sort({ createdAt: -1 });
    res.json({ status: 'Success', data: reports });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// Update GBP Report
export const updateGbpReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReport = await gbpModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedReport) {
      return res.status(404).json({ status: 'Failed', message: 'GBP Report not found' });
    }

    res.json({ status: 'Success', message: 'GBP Report Updated', data: updatedReport });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// Delete GBP Report
export const deleteGbpReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await gbpModel.findByIdAndDelete(id);
    if (!deletedReport) {
      return res.status(404).json({ status: 'Failed', message: 'GBP Report not found' });
    }

    res.json({ status: 'Success', message: 'GBP Report Deleted' });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};
