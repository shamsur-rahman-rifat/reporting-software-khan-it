import OrganicModel from '../model/OrganicReport.js';
import projectModel from '../model/Project.js';

// Add new Organic Report
export const addOrganicReport = async (req, res) => {
  try {
    const { project, traffic_source, top_country, device } = req.body;

    // Generate report month
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long", year: "numeric" });    

    // Validate project existence
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Project not found'
      });
    }

    // Check if Organic report already exists for same project & month
    const existingReport = await OrganicModel.findOne({ project, month });
    if (existingReport) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Organic report already exists for this project and month'
      });
    }

    // Create new Organic report
    const newReport = new OrganicModel({
      project,
      month,
      traffic_source: traffic_source || {},
      top_country: top_country || {},
      device: device || {}
    });

    await newReport.save();

    res.json({
      status: 'Success',
      message: 'Organic Report Added'
    });

  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// View all Organic Reports
export const viewAllOrganicReports = async (req, res) => {
  try {
    const reports = await OrganicModel
      .find()
      .populate('project', 'website')
      .sort({ createdAt: -1 });

    res.json({
      status: 'Success',
      data: reports
    });

  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// View Organic Reports by Project
export const viewOrganicReportsByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectExists = await projectModel.findById(id);
    if (!projectExists) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Project not found'
      });
    }

    const reports = await OrganicModel
      .find({ project: id })
      .sort({ createdAt: -1 });

    res.json({
      status: 'Success',
      data: reports
    });

  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Update Organic Report
export const updateOrganicReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReport = await OrganicModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Organic Report not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Organic Report Updated',
      data: updatedReport
    });

  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Delete Organic Report
export const deleteOrganicReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await OrganicModel.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Organic Report not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Organic Report Deleted'
    });

  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};