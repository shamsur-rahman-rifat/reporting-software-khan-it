import socialOptimizationModel from '../model/SocialOptimize.js';
import projectModel from '../model/Project.js';

// Add or Update Social Media Optimization Record
export const addSocialOptimization = async (req, res) => {
  try {
    const { project, platform, status } = req.body;

    // Validate project existence
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    // Check if a social optimization record already exists for this project & platform
    const existingRecord = await socialOptimizationModel.findOne({ project, platform });
    if (existingRecord) {
      // Update existing record
      existingRecord.status = status || existingRecord.status;
      await existingRecord.save();
      return res.json({
        status: 'Success',
        message: 'Social Media Optimization Record Updated',
        data: existingRecord
      });
    }

    // Create new social optimization record
    const newRecord = new socialOptimizationModel({
      project,
      platform,
      status: status || 'Optimized'
    });

    await newRecord.save();
    res.json({ status: 'Success', message: 'Social Media Optimization Record Added' });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View all Social Media Optimization Records
export const viewAllSocialOptimizations = async (req, res) => {
  try {
    const records = await socialOptimizationModel.find().populate('project', 'website');
    res.json({ status: 'Success', data: records });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// View Social Media Optimization Records by Project
export const viewSocialOptimizationsByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectExists = await projectModel.findById(id);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    const records = await socialOptimizationModel.find({ project: id }).sort({ createdAt: -1 });
    res.json({ status: 'Success', data: records });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// Update Social Media Optimization Record
export const updateSocialOptimization = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReport = await socialOptimizationModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedReport) {
      return res.status(404).json({ status: 'Failed', message: 'Record not found' });
    }

    res.json({
      status: 'Success',
      message: 'Social Media Optimization Record Updated',
      data: updatedReport
    });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};

// Delete Social Media Optimization Record
export const deleteSocialOptimization = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await socialOptimizationModel.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ status: 'Failed', message: 'Record not found' });
    }

    res.json({ status: 'Success', message: 'Social Media Optimization Record Deleted' });

  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};