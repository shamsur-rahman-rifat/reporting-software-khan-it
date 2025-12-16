import onPageModel from '../model/OnPageReport.js';
import projectModel from '../model/Project.js'; 

// Add new On Page Report
export const addOnPageReport = async (req, res) => {
  try {
    const { project, status, url } = req.body;
    const createdBy = req.headers['email']

    // Generate report month
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });    

    // Check if the project exists
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    const newReport = new onPageModel({project,createdBy,status,url,reportMonth});

    await newReport.save();
    res.json({ status: 'Success', message: 'On Page Report Added' });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View all reports
export const viewOnPageReports = async (req, res) => {
  try {
    const result = await onPageModel.find().populate('project', 'website');
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View reports by specific project
export const viewReportsByProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the project exists
    const projectExists = await projectModel.findById(id);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }
    const reports = await onPageModel.find({ project: id });
    res.json({ status: 'Success', data: reports });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};


// Update an existing report
export const updateOnPageReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReport = await onPageModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedReport) {
      return res.status(404).json({ status: 'Failed', message: 'Report not found' });
    }

    res.json({ status: 'Success', message: 'On Page Report Updated', data: updatedReport });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// Delete a report
export const deleteOnPageReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await onPageModel.findByIdAndDelete(id);
    if (!deletedReport) {
      return res.status(404).json({ status: 'Failed', message: 'Report not found' });
    }

    res.json({ status: 'Success', message: 'On Page Report Deleted' });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};