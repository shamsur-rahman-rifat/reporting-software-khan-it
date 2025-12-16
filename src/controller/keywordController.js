import keywordModel from "../model/Keyword.js";
import projectModel from "../model/Project.js";

export const addKeyword = async (req, res) => {
  try {
    let reqBody = req.body;
    const createdBy = req.headers["email"];

    // ✅ Normalize input to always be an array
    if (!Array.isArray(reqBody)) {
      reqBody = [reqBody];
    }

    // ✅ Validate that all have a valid project ID
    const projectIds = [...new Set(reqBody.map(item => item.project))];
    const validProjects = await projectModel.find({ _id: { $in: projectIds } });
    const validProjectIds = validProjects.map(p => p._id.toString());

    const invalidProjects = projectIds.filter(id => !validProjectIds.includes(id));
    if (invalidProjects.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: `Invalid project IDs: ${invalidProjects.join(", ")}`,
      });
    }

    // ✅ Attach createdBy and timestamps
    const keywords = reqBody.map(item => ({
      ...item,
      createdBy,
    }));

    // ✅ Insert all at once (high performance)
    await keywordModel.insertMany(keywords);

    res.json({
      status: "Success",
      message: `${keywords.length} Keyword record(s) added successfully.`,
    });
  } catch (error) {
    res.json({
      status: "Failed",
      message: error.message || "Something went wrong",
    });
  }
};


export const getKeywords = async (req, res) => {
  try {
    const result = await keywordModel.find()
      .populate('project', 'website')
      .sort({ createdAt: -1 });
    
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};


// ✅ Get keywords for a specific project
export const getKeywordsByProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const projectExists = await projectModel.findById(id);
    if (!projectExists) {
      return res.status(400).json({ status: 'Failed', message: 'Project not found' });
    }

    const result = await keywordModel.find({ project: id }).sort({ createdAt: -1 });
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};


// ✅ Update keyword record
export const updateKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await keywordModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ status: 'Failed', message: 'Keyword record not found' });
    }

    res.json({ status: 'Success', message: 'Keyword Updated' });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};


// ✅ Delete keyword record
export const deleteKeyword = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await keywordModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ status: 'Failed', message: 'Keyword record not found' });
    }

    res.json({ status: 'Success', message: 'Keyword Deleted' });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message });
  }
};
